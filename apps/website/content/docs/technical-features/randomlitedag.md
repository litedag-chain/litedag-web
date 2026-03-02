---
title: RandomLiteDAG
weight: 6
---

The LiteDAG protocol (and all its compatible merge-mined forks) use the RandomLiteDAG mining algorithm to secure the blockchain.

RandomLiteDAG is based upon [Tevador's RandomX](https://github.com/tevador/randomx) with some minor modifications:
- RANDOMX_ARGON_ITERATIONS reduced from 3 to 1.
- RANDOMX_ARGON_SALT set to `RandomVIREL\x03`
- RANDOMX_PROGRAM_ITERATIONS reduced from 2048 to `1821`.
- RANDOMX_PROGRAM_COUNT reduced from 8 to `4`.
- RANDOMX_SCRATCHPAD_L3 reduced from `2097152` to `1048576`.

Overall, these changes make the algorithm faster, especially on low-end devices with reduced processor cache. This enables faster throughput.
