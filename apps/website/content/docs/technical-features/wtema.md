---
title: WTEMA
weight: 6
---

WTEMA (Weighted-target Exponential Moving Average) is the DAA (Difficulty Adjustment Algorithm) used by LiteDAG.

## Why WTEMA?
WTEMA is a close approximation of the ASERT difficulty algorithm, without floating-point math emulation requirements.
After multiple researches and [simulations](https://github.com/zawy12/difficulty-algorithms/issues/62#issuecomment-646159947)
on several DAA algorithms, ASERT/WTEMA have resulted to be the best under several scenarios.
The simplicity and effectiveness of the WTEMA algorithm made it the ideal choice as a LiteDAG blockchain DAA.


