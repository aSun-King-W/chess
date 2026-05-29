# Pikafish engine assets

This directory contains the optional Pikafish WebAssembly engine used by `src/xiangqiEngine.ts`.

Runtime files:

- `/pikafish-engine-worker.js`: local bridge worker. It accepts string UCI commands such as `uci`, `isready`, `position fen ...`, and `go movetime 600`, then posts UCI output lines such as `readyok` and `bestmove h9g7`.
- `single/pikafish.js`: official Pikafish Web single-thread JavaScript loader.
- `single/pikafish.wasm`: official Pikafish Web single-thread WASM binary.
- `data/pikafish.data`: official Pikafish Web NNUE data package.

The app automatically falls back to the local heuristic AI if this worker is missing, fails to load, times out, or returns an illegal move.

Pikafish is GPL-3.0 software. The bundled WebAssembly assets were copied from the public Pikafish Web Version on 2026-05-29:

- Web app: https://xiangqiai.com/
- JS/WASM source paths:
  - https://xiangqiai.com/engine/main_20240816v7/single/pikafish.js
  - https://xiangqiai.com/engine/main_20240816v7/single/pikafish.wasm
  - https://xiangqiai.com/engine/main_20240816v7/data/pikafish.data

Upstream project/source pointers:

- Official site: https://www.pikafish.com/
- Source: https://github.com/official-pikafish/Pikafish
- Releases: https://github.com/official-pikafish/Pikafish/releases/latest
