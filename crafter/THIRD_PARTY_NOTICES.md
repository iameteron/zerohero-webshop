# Third-party notices

This standalone demo derives from
[ZeroHero](https://github.com/iameteron/ZeroHero/tree/iclr2027-crafter-experiments).
The notices below apply to the named upstream components; no repository-wide
license or additional license grant for the model weights is added here.

## Model and game sources

The demo ships a ZeroHero 12,593,280-parameter Qwen3-VL student trained on Crafter.
Its [release manifest](assets/models/vision-memory/manifest.json) records the checkpoint,
the FP32 ONNX graph hashes and the conversion checks.

`assets/world.zip` retains original Crafter sources, graphics, and dependencies.
BALROG observation functions and instructions come from commit
`b7afe79e3e4265811cfa985ed7c95c4d1a11e3f5`. The browser bridge normalizes terrain
seeds to the original 64-bit Python behavior and retains the original
2,000-decision horizon. The demo's browser worker applies a shorter 512-step
time limit and reports truncation separately. Individual source hashes are in
`assets/world-provenance.json`.

| Component | Retained license text |
|---|---|
| [Crafter 1.8.3](https://github.com/danijar/crafter), Danijar Hafner | [MIT](licenses/crafter-1.8.3-LICENSE.txt) |
| [BALROG](https://github.com/BALROG-ai/BALROG/tree/b7afe79e3e4265811cfa985ed7c95c4d1a11e3f5), BALROG Team | [MIT](licenses/BALROG-LICENSE.txt) |
| [imageio 2.37.2](https://github.com/imageio/imageio) | [BSD terms](licenses/imageio-2.37.2-LICENSE.txt) |
| [opensimplex 0.4.5.1](https://github.com/lmas/opensimplex) | [MIT](licenses/opensimplex-0.4.5.1-LICENSE.txt) |
| [ruamel.yaml 0.19.1](https://yaml.dev/doc/ruamel.yaml/) | [MIT](licenses/ruamel_yaml-0.19.1-LICENSE.txt) |

The four Python-package license texts above were copied verbatim from their
bundled distribution metadata. BALROG's license was copied from its pinned
source checkout.

## Browser runtimes and build dependencies

| Component | Retained license texts and notices |
|---|---|
| [ONNX Runtime 1.22.0](https://github.com/microsoft/onnxruntime/tree/v1.22.0) | [MIT](licenses/onnxruntime-LICENSE.txt), [third-party notices](licenses/onnxruntime-ThirdPartyNotices.txt) |
| [Hugging Face tokenizers.js 0.2.0](https://github.com/huggingface/tokenizers.js) | [Apache 2.0](licenses/huggingface-tokenizers-LICENSE.txt) |
| [Pyodide 0.27.7](https://github.com/pyodide/pyodide/tree/0.27.7) | [MPL 2.0](licenses/pyodide-LICENSE.txt) |
| [CPython 3.12.7](https://github.com/python/cpython/tree/v3.12.7) | [Python license and included notices](licenses/CPython-LICENSE.txt) |
| NumPy 2.0.2 | [Bundled package and component notices](licenses/numpy/) |
| Pillow 10.2.0 | [Bundled license and notices](licenses/pillow/pillow-10.2.0.dist-info/licenses/LICENSE) |
| SciPy 1.14.1 | [Bundled package and component notices](licenses/scipy/) |
| [OpenBLAS 0.3.26](https://github.com/OpenMathLib/OpenBLAS/tree/v0.3.26) | [BSD terms](licenses/OpenBLAS-LICENSE.txt) |
| [esbuild 0.25.12](https://github.com/evanw/esbuild/tree/v0.25.12) | [MIT](licenses/esbuild-LICENSE.txt) |
| [Inter, via @fontsource-variable/inter 5.3.0](https://github.com/rsms/inter) | [SIL Open Font License 1.1](licenses/Inter-LICENSE.txt) |

NumPy, Pillow, and SciPy notices were copied from the exact vendored Pyodide
wheels. Hugging Face and esbuild licenses were copied from matching installed
npm packages. ONNX Runtime, Pyodide, CPython, and OpenBLAS texts were copied
from the exact upstream version tags linked above. Nested component notices
are retained alongside the package license texts.

## Added checkpoints (2026-11-25)

The three added PPO-RA checkpoints come from eteron on Hugging Face and are released under Apache-2.0; each model directory contains its LICENSE and links back to its model card. The original visual PPO checkpoint and its notices are preserved.
