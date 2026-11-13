# ZeroHero in WebShop

[Open the browser demo](https://iameteron.github.io/zerohero-webshop/). Choose one of 500 evaluation tasks, run the agent step by step or continuously, or operate the storefront yourself. Click the task instruction to search the list, or use the arrows beside it to switch tasks. Choose Manual to take over the current episode. The arrows beside the step counter pause generation and show recorded storefronts, actions and model responses. Latest returns to the end of the trajectory to continue playing. A purchase ends the episode and receives the WebShop reward. The episode limit is 50 actions.

## Checkpoint

Use the model selector beside Agent to switch between TCOD SFT (epoch 4) and PPO (cycle 100). Switching restarts the selected task at step zero. PPO continued training from the TCOD SFT checkpoint. Both use the ZeroHero 10M action-balanced Qwen3 decoder with 9,983,616 parameters, a 4,096-token vocabulary and an 8,192-token context. TCOD SFT used 22,005 demonstration steps from 4,068 instructions. The source dataset is [TCOD WebShop teacher trajectories](https://huggingface.co/datasets/ryan-superman/tcod-webshop-teacher-trajectories/tree/d70040273ae75aef55ff8238a9b94363032d245c).

| Native small_synthetic eval500 | TCOD SFT · epoch 4 | PPO · cycle 100 |
| --- | --- | --- |
| Full success within 15 steps | 158/500 (31.6%) | 207/500 (41.4%) |
| Full success within 25 steps | 159/500 (31.8%) | 215/500 (43.0%) |
| Full success within 50 steps | 159/500 (31.8%) | 217/500 (43.4%) |
| Mean purchase reward | 0.7411 | 0.7835 |

These scores come from the native evaluations. The demo presents the same storefront task to both models. In the native PPO evaluation, 24 of the 500 instructions had a different price ceiling from the TCOD task set used here. A full success earns reward 1. The default decoder samples at temperature 1 with per-task and per-step seeds matching the evaluation. Greedy decoding is available for exploration.

Download FP32 weights and inspect the export manifests for [TCOD SFT](model/) and [PPO cycle 100](model-ppo100/). The response limits used for these evaluations are 1,024 and 512 tokens respectively.

## Runtime

The static page downloads the selected FP32 ONNX decoder (46.3 MB) and runs it in a dedicated web worker with ONNX Runtime Web and a KV cache. To serve a checkout locally, run `python3 -m http.server 8000` at its root and open `http://localhost:8000/`. Use a modern browser with WebAssembly SIMD, Web Crypto and DecompressionStream. Model inference, search and reward calculation run on the device. Product photos load from catalog image URLs.

The environment contains the 1,000-product small_synthetic catalog and the 500 native evaluation tasks at goal seed 1000. The renderer uses the original WebShop page templates and the styling of the ZeroHero browser viewer. Browsing, item options, pagination, subpages and purchase rewards update in response to actions. Search uses pre-exported Lucene term scores. The client calculates rewards from native per-product matches and the options selected in the current episode.

For validation, replaying the native TCOD SFT eval500 actions in Chrome reproduced every pre-action observation, action-validity flag and final reward across 4,987 steps. A cached browser forward pass on a test prompt matched Transformers token IDs and had a maximum absolute logit difference of 0.000014. Live sampling in different numerical runtimes can diverge.

The model exporter is in [tools/export_model.py](tools/export_model.py). The catalog exporter requires the ZeroHero environment wrapper and the corresponding native WebShop installation. Template, runtime and dependency notices are in [licenses](licenses/). The browser playground follows the [zero-wasm demo](https://github.com/Tviskaron/zero-wasm).
