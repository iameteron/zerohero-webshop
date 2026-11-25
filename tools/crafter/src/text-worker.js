import * as ort from 'onnxruntime-web/wasm';
import { Tokenizer } from '@huggingface/tokenizers';
import { sample } from './sampling.js';

const root = new URL('../', import.meta.url);
ort.env.wasm.wasmPaths = new URL('vendor/ort/', root).href;
ort.env.wasm.numThreads = 1;
let session, tokenizer, manifest, active = null, cancelled = false;
const send = (type, data = {}) => self.postMessage({ type, ...data });
const pause = () => new Promise(resolve => setTimeout(resolve, 0));

async function load(directory) {
  const base = new URL(`assets/models/${directory}/`, root);
  const json = async name => {
    const response = await fetch(new URL(name, base));
    if (!response.ok) throw Error(`Cannot load ${name}: ${response.status}`);
    return response.json();
  };
  const [meta, vocabulary, config] = await Promise.all(['manifest.json','tokenizer.json','tokenizer_config.json'].map(json));
  manifest = meta;tokenizer = new Tokenizer(vocabulary, config);
  const response = await fetch(new URL(`decoder.onnx?sha256=${meta.onnx_sha256}`, base));
  if (!response.ok) throw Error(`Cannot load model: ${response.status}`);
  const reader = response.body.getReader(), bytes = new Uint8Array(meta.bytes);
  let loaded = 0;
  while (true) {
    const {done, value} = await reader.read();if (done) break;
    bytes.set(value, loaded);loaded += value.length;send('download',{loaded,total:meta.bytes});
  }
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
  if (digest !== meta.onnx_sha256) throw Error('Model checksum mismatch');
  session = await ort.InferenceSession.create(bytes,{executionProviders:['wasm']});
  send('ready',{manifest,threads:1});
}

function prompt(message) {
  const history = message.history.slice(-4);
  const encode = text => tokenizer.encode(text,{add_special_tokens:false}).ids;
  const render = () => [manifest.instructions,'\nRecent history:',
    ...history.flatMap(row=>['Observation: '+row.text.long_term_context,'Action: '+row.action]),
    '\nCurrent observation:',message.text.long_term_context,message.text.short_term_context,'\nResponse:\n'].join('\n');
  let ids = encode(render());
  while (history.length && ids.length + message.maxNewTokens > manifest.context) { history.shift();ids=encode(render()); }
  if (ids.length + message.maxNewTokens > manifest.context) throw Error('Observation exceeds the trained context. Start a new world.');
  return ids;
}

async function generate(message) {
  if (!session || active !== null) throw Error('Model is not ready');
  active=message.id;cancelled=false;
  const started=performance.now();let logits;
  let cache=Array.from({length:2*manifest.layers},()=>new ort.Tensor('float32',new Float32Array(0),[1,manifest.kv_heads,0,manifest.head_dim]));
  async function forward(ids) {
    const input=new ort.Tensor('int64',BigInt64Array.from(ids,BigInt),[1,ids.length]);
    const feeds={input_ids:input};
    for(let i=0;i<manifest.layers;i++){feeds[`past_key_${i}`]=cache[2*i];feeds[`past_value_${i}`]=cache[2*i+1];}
    try {
      const result=await session.run(feeds);cache.forEach(t=>t.dispose());logits?.dispose();
      cache=[];for(let i=0;i<manifest.layers;i++)cache.push(result[`present_key_${i}`],result[`present_value_${i}`]);
      logits=result.logits;
    } finally {input.dispose();}
  }
  try {
    const ids=prompt(message),generated=[];
    for(let i=0;i<ids.length&&!cancelled;i+=64){await forward(ids.slice(i,i+64));send('prefill',{id:active,completed:Math.min(i+64,ids.length),total:ids.length});await pause();}
    const cap=Math.min(message.maxNewTokens,manifest.response_cap,message.samplingDraws.length);
    let ended=false;const decodeStart=performance.now();
    for(let i=0;i<cap&&!cancelled;i++){
      const token=sample(logits.data,message.temperature,message.samplingDraws[i]);
      if(token===manifest.eos){ended=true;break;}
      generated.push(token);
      if(i%4===0)send('tokens',{id:active,text:tokenizer.decode(generated,{skip_special_tokens:true}),tokens:generated.length,tokensPerSecond:generated.length/Math.max(.001,(performance.now()-decodeStart)/1000)});
      if(i+1<cap)await forward([token]);await pause();
    }
    const text=tokenizer.decode(generated,{skip_special_tokens:true});
    const action=text.replace(/[^a-zA-Z\s:]/g,'').split('ACTION:').at(-1).trim();
    send('result',{id:active,text,tokens:generated.length,seconds:(performance.now()-started)/1000,cancelled,capHit:!ended&&generated.length===cap,
      answer:message.actions.includes(action)?{action,memoryText:'',memory:[]}:null});
  } finally {logits?.dispose();cache.forEach(t=>t.dispose());active=null;}
}
self.onmessage=({data})=>{
  if(data.type==='cancel'){if(data.id===active)cancelled=true;return;}
  const task=data.type==='load'?load(data.directory):generate(data);
  task.catch(error=>send('error',{id:data.id??null,message:error.stack||String(error)}));
};
