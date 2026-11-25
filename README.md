# ZeroHero in WebShop and Crafter

[Open the browser demo](https://iameteron.github.io/zerohero/). Select **WebShop** or **Crafter** at the top. Switching environments opens a fresh session. Only the selected simulator and agent load.

[Open Crafter directly](https://iameteron.github.io/zerohero/?env=crafter). The tab now serves its own copy of the [original zero-wasm playground](https://github.com/Tviskaron/zero-wasm). All inference and simulation remain local to the browser.

Crafter offers four clearly labeled checkpoints:

| Model | Exact environment steps | Weights |
| --- | ---: | --- |
| Visual · PPO-RA · 1B steps | 1,000,128,512 | [Hugging Face](https://huggingface.co/eteron/ZeroHero-Crafter-Visual-12.6M-PPO-RA-1B-steps) |
| Visual · PPO-RA · 100M steps | 100,007,936 | [Hugging Face](https://huggingface.co/eteron/ZeroHero-Crafter-Visual-12.6M-PPO-RA-100M-steps) |
| Text · PPO-RA · 63.6M steps | 63,635,456 | [Hugging Face](https://huggingface.co/eteron/ZeroHero-Crafter-Text-5M-PPO-RA-63.6M-steps) |
| Visual · PPO · 874M steps | 874,037,248 | Existing zero-wasm checkpoint, preserved |

Visual agents use RGB screens, achievements, and their generated memory. The text agent uses BALROG text observations and the last four observation/action turns. Changing models restarts the world and clears memory. The browser's episode limit remains 512 steps; this playground is not a reproduction of the native CUDA benchmark.

The new checkpoint weights are Apache-2.0. Original runtime and environment notices remain in [crafter/THIRD_PARTY_NOTICES.md](crafter/THIRD_PARTY_NOTICES.md). Browser source and tests are retained in [tools/crafter](tools/crafter/). To rebuild, run `npm ci`, `node --test --test-isolation=none tests/*.test.mjs`, and `node build.mjs` there, then copy `dist/` into `crafter/` at the repository root.

## WebShop

Choose one of 500 evaluation tasks, run the agent step by step or continuously, or operate the storefront yourself. Click the task instruction to search the list, or use the arrows beside it to switch tasks. Choose Manual to take over the current episode. The arrows beside the step counter pause generation and show recorded storefronts, actions and model responses. Latest returns to the end of the trajectory to continue playing. A purchase ends the episode and receives the WebShop reward. The episode limit is 50 actions.

## Checkpoint

Use the model selector beside Agent to choose **SFT · epoch 4**, **PPO · cycle 100**, or the new **PPO-RA · 720.9K steps** (720,896 exact environment decisions). The new [PPO-RA checkpoint](https://huggingface.co/eteron/ZeroHero-WebShop-10M-PPO-RA) is the default. The table below describes the two previously available checkpoints; no new benchmark result is claimed for the PPO-RA browser export. Switching restarts the selected task at step zero. PPO continued training from the TCOD SFT checkpoint. All three use the ZeroHero 10M action-balanced Qwen3 decoder with 9,983,616 parameters, a 4,096-token vocabulary and an 8,192-token context. TCOD SFT used 22,005 demonstration steps from 4,068 instructions. The source dataset is [TCOD WebShop teacher trajectories](https://huggingface.co/datasets/ryan-superman/tcod-webshop-teacher-trajectories/tree/d70040273ae75aef55ff8238a9b94363032d245c).

| Native small_synthetic eval500 | TCOD SFT · epoch 4 | PPO · cycle 100 |
| --- | --- | --- |
| Full success within 15 steps | 158/500 (31.6%) | 207/500 (41.4%) |
| Full success within 25 steps | 159/500 (31.8%) | 215/500 (43.0%) |
| Full success within 50 steps | 159/500 (31.8%) | 217/500 (43.4%) |
| Mean purchase reward | 0.7411 | 0.7835 |

These scores come from the native evaluations. The demo presents the same storefront task to both models. In the native PPO evaluation, 24 of the 500 instructions had a different price ceiling from the TCOD task set used here. A full success earns reward 1. The default decoder samples at temperature 1 with per-task and per-step seeds matching the evaluation. Greedy decoding is available for exploration.

Download FP32 weights and inspect the export manifests for [TCOD SFT](model/) and [PPO cycle 100](model-ppo100/). The response limits used for these evaluations are 1,024 and 512 tokens respectively.

## Runtime

The static page downloads the selected FP32 ONNX decoder (46.3 MB) and runs it in a dedicated web worker with ONNX Runtime Web and a KV cache. To serve a checkout locally, run `python3 -m http.server 8000` at its root and open `http://localhost:8000/webshop.html`. Use a modern browser with WebAssembly SIMD, Web Crypto and DecompressionStream. Model inference, search and reward calculation run on the device. Product photos load from catalog image URLs.

The environment contains the 1,000-product small_synthetic catalog and the 500 native evaluation tasks at goal seed 1000. The renderer uses the original WebShop page templates and the styling of the ZeroHero browser viewer. Browsing, item options, pagination, subpages and purchase rewards update in response to actions. Search uses pre-exported Lucene term scores. The client calculates rewards from native per-product matches and the options selected in the current episode.

For validation, replaying the native TCOD SFT eval500 actions in Chrome reproduced every pre-action observation, action-validity flag and final reward across 4,987 steps. A cached browser forward pass on a test prompt matched Transformers token IDs and had a maximum absolute logit difference of 0.000014. Live sampling in different numerical runtimes can diverge.

The model exporter is in [tools/export_model.py](tools/export_model.py). The catalog exporter requires the ZeroHero environment wrapper and the corresponding native WebShop installation. Template, runtime and dependency notices are in [licenses](licenses/). The browser playground follows the [zero-wasm demo](https://github.com/Tviskaron/zero-wasm).

The four new ONNX exports were checked against their FP32 Transformers policies for prefill and 12 cached greedy tokens. The maximum absolute logit difference was below 0.000031; vision features differed by less than 0.000073. Exact graph hashes and checks are recorded in each model manifest.
