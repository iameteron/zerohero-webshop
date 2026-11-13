"""Export the FP32 ZeroHero Qwen3 text decoder with chunked prefill and a dynamic KV cache."""
import argparse
import hashlib
import json
from pathlib import Path
import torch
import torch.nn.functional as F
from safetensors.torch import load_file


class Decoder(torch.nn.Module):
    def __init__(self, path, config):
        super().__init__()
        self.config = config
        for name, value in load_file(path).items():
            self.register_buffer(name.replace('.', '__'), value)
        d = config['head_dim']
        self.register_buffer('frequency', config['rope_theta'] ** (-torch.arange(0, d, 2).float()/d))

    def weight(self, name):
        return getattr(self, ('model.'+name+'.weight').replace('.', '__'))

    def norm(self, x, name):
        return x * torch.rsqrt(x.square().mean(-1, keepdim=True) + self.config['rms_norm_eps']) * self.weight(name)

    def forward(self, input_ids, *past):
        c = self.config
        heads, kv, dim = c['num_attention_heads'], c['num_key_value_heads'], c['head_dim']
        length, offset = input_ids.shape[1], past[0].shape[2]
        pos = torch.arange(length) + offset
        phase = pos.float()[:, None] * self.frequency
        phase = torch.cat([phase, phase], -1)
        mask = torch.arange(length + offset)[None, :] <= pos[:, None]
        def rotate(x):
            left, right = x.chunk(2, dim=-1)
            return x*phase.cos() + torch.cat([-right, left], dim=-1)*phase.sin()
        x = F.embedding(input_ids, self.weight('embed_tokens'))
        present = []
        for i in range(c['num_hidden_layers']):
            prefix = f'layers.{i}.'
            def linear(v, name):
                return F.linear(v, self.weight(prefix+name))
            h = self.norm(x, prefix+'input_layernorm')
            def project(name, count):
                return linear(h, 'self_attn.'+name+'_proj').reshape(1,-1,count,dim).transpose(1,2)
            q = rotate(self.norm(project('q', heads), prefix+'self_attn.q_norm'))
            k = rotate(self.norm(project('k', kv), prefix+'self_attn.k_norm'))
            k = torch.cat((past[2*i], k),dim=2)
            v = torch.cat((past[2*i+1], project('v',kv)),dim=2)
            present += [k,v]
            def repeat(t):
                return t.unsqueeze(2).expand(1,kv,heads//kv,-1,dim).reshape(1,heads,-1,dim)
            a = ((q @ repeat(k).transpose(-1,-2)) * dim**-.5).masked_fill(~mask,-1e30).softmax(-1)
            h = (a @ repeat(v)).transpose(1,2).reshape(1,-1,heads*dim)
            x = x + linear(h,'self_attn.o_proj')
            h = self.norm(x,prefix+'post_attention_layernorm')
            x = x + linear(F.silu(linear(h,'mlp.gate_proj'))*linear(h,'mlp.up_proj'),'mlp.down_proj')
        logits = F.linear(self.norm(x[:, -1, :], 'norm'),self.weight('embed_tokens'))
        return logits, *present


if __name__ == '__main__':
    p=argparse.ArgumentParser();p.add_argument('weights',type=Path);p.add_argument('model_dir',type=Path)
    stage=p.add_mutually_exclusive_group()
    stage.add_argument('--epoch',type=int,default=4)
    stage.add_argument('--cycle',type=int)
    p.add_argument('--response-cap',type=int,default=1024)
    a=p.parse_args()
    cfg=json.loads((a.model_dir/'config.json').read_text())
    model=Decoder(str(a.weights),cfg).eval()
    names=[f'{kind}_{i}' for i in range(cfg['num_hidden_layers']) for kind in ('key','value')]
    inputs=['input_ids']+['past_'+k for k in names];outputs=['logits']+['present_'+k for k in names]
    axes={'input_ids':{1:'tokens'},**{s:{2:'past'} for s in inputs[1:]},**{s:{2:'total'} for s in outputs[1:]}}
    out=a.model_dir/'decoder.onnx'
    cache=tuple(torch.zeros(1,cfg['num_key_value_heads'],2,cfg['head_dim']) for _ in names)
    with torch.no_grad():
        torch.onnx.export(model,(torch.tensor([[21,3,78]]),*cache),str(out),input_names=inputs,output_names=outputs,
                          opset_version=17,dynamic_axes=axes,dynamo=False)
    sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
    stage_info = {'cycle': a.cycle} if a.cycle is not None else {'epoch': a.epoch}
    (a.model_dir/'manifest.json').write_text(json.dumps(dict(**stage_info,parameters=9983616,source_sha256=sha(a.weights),
        onnx_sha256=sha(out),bytes=out.stat().st_size,layers=cfg['num_hidden_layers'],kv_heads=cfg['num_key_value_heads'],
        head_dim=cfg['head_dim'],context=8192,response_cap=a.response_cap,eos=2),indent=2))
