# ZeroHero in WebShop

[Open the browser demo](https://iameteron.github.io/zerohero-webshop/). Choose one of 500 evaluation tasks, run the agent step by step or continuously, or operate the storefront yourself. The action trace shows the model's generated response. A purchase ends the episode and receives the WebShop reward. The episode limit is 50 actions.

## Checkpoint

The single policy in this demo is ZeroHero 10M action-balanced, TCOD SFT epoch 4. It is a Qwen3 decoder with 9,983,616 parameters, a 4,096-token vocabulary and an 8,192-token context. Training used 22,005 demonstration steps from 4,068 instructions. The source dataset is [TCOD WebShop teacher trajectories](https://huggingface.co/datasets/ryan-superman/tcod-webshop-teacher-trajectories/tree/d70040273ae75aef55ff8238a9b94363032d245c).

| Native small_synthetic eval500 | Result |
| --- | --- |
| Full success within 15 steps | 158/500 (31.6%) |
| Full success within 25 steps | 159/500 (31.8%) |
| Full success within 50 steps | 159/500 (31.8%) |
| Mean purchase reward | 0.7411 |

A full success earns reward 1. The default decoder samples at temperature 1 with per-task and per-step seeds matching the evaluation. Greedy decoding is available for exploration.

[Original FP32 weights](model/model.safetensors) · [Transformers configuration and tokenizer](model/) · [ONNX and checkpoint SHA-256](model/manifest.json).

## Runtime

The static page downloads its FP32 ONNX decoder (46.3 MB) and runs it in a dedicated web worker with ONNX Runtime Web and a KV cache. To serve a checkout locally, run `python3 -m http.server 8000` at its root and open `http://localhost:8000/`. Use a modern browser with WebAssembly SIMD, Web Crypto and DecompressionStream. Model inference, search and reward calculation run on the device. Product photos load from catalog image URLs.

The environment contains the 1,000-product small_synthetic catalog and the 500 native evaluation tasks at goal seed 1000. The renderer uses the original WebShop page templates and the styling of the ZeroHero browser viewer. Browsing, item options, pagination, subpages and purchase rewards update in response to actions. Search uses pre-exported Lucene term scores. The client calculates rewards from native per-product matches and the options selected in the current episode.

For validation, replaying the native eval500 actions in Chrome reproduced every pre-action observation, action-validity flag and final reward across 4,987 steps. A cached browser forward pass on a test prompt matched Transformers token IDs and had a maximum absolute logit difference of 0.000014. Live sampling in different numerical runtimes can diverge.

The model exporter is in [tools/export_model.py](tools/export_model.py). The catalog exporter requires the ZeroHero environment wrapper and the corresponding native WebShop installation. Template, runtime and dependency notices are in [licenses](licenses/). The browser playground follows the [zero-wasm demo](https://github.com/Tviskaron/zero-wasm).
