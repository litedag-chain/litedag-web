---
title: LTTC
weight: 4
---

LTTC (Long-Term Timestamp Correction) is a feature backed in LiteDAG's difficulty algorithm which
guarantees the accuracy of the long-term block time.

## How does LTTC work?
LTTC calculates the expected timestamp of a block `b` using this formula:
```
expect_timestamp := b.Height * TARGET_BLOCK_TIME_MS + GENESIS_TIMESTAMP
```

If a block's timestamp is too large, or too small, compared to the expected timestamp,
the target block time is multiplied by `2/3` or `3/2` to adjust the long-term average block time within specified bounds.

Thanks to LTTC, it is possible to accurately estimate the network time at any given future height (with an error of ±30 minutes at most). It also enforces the accuracy of emission curve over time.