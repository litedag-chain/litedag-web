---
title: LiteDAG Stratum documentation
---

The LiteDAG blockchain uses a modified version of the [XMRig Monero Stratum protocol](https://github.com/xmrig/xmrig-proxy/blob/master/doc/STRATUM.md), with a few differences to allow changing the nonce-extra to split the same job between multiple miners, and changes to better allow merge-mining.

The LiteDAG node has an integrated Stratum server on port `6312` by default. Miners or pools can connect to the Stratum to receive the latest jobs and submit blocks.

## Protocol documentation

### login
Miner send `login` request after connection successfully established for authorization.

#### Example request:
```json
{
	"id": 1,
	"jsonrpc": "2.0",
	"method": "login",
	"params": {
		"login": "your litedag wallet here",
		"pass": "x",
		"agent": "LiteDAGMiningPool/1.0.0",
		"algo": ["rx/litedag"] // list of supported algorithms; should include rx/litedag (RandomLiteDAG)
	}
}
```

#### Example successful reply:
```json
{
	"id": 1,
	"jsonrpc": "2.0",
	"error": null,
	"result": {
		"id": "", // this field is only for compatibility and is currently not used
		"job": {
			"algo": "rx/litedag",
			"blob": "070780e6b9d60586ba419a0c224e3c6c3e134cc45c4fa04d8ee2d91c2595463c57eef0a4f0796c000000002fcc4d62fa6c77e76c30017c768be5c61d83ec9d3a085d524ba8053ecc3224660d",
			"job_id": "q7PLUPL25UV0z5Ij14IyMk8htXbj",
			"target": "fcb24954b88d0600",
			"height": 152,
			"seed_hash": "a4244aa43ddd6e3ef9e64bb80f4ee952f68232aa008d3da9c78e3b627e5675c8"
		},
		"extensions": ["algo", "keepalive"],
		"status": "OK"
	}
}
```
Note: the `target` may be 4 or 8 bytes long.

### job
A new job is sent to the miner/client. The miner or pool client should switch to new job as fast as possible.
This is a notification so no reply is expected.

```json
{
	"jsonrpc": "2.0",
	"method": "job",
	"params": {
		"algo": "rx/litedag",
		"blob": "070780e6b9d60586ba419a0c224e3c6c3e134cc45c4fa04d8ee2d91c2595463c57eef0a4f0796c000000002fcc4d62fa6c77e76c30017c768be5c61d83ec9d3a085d524ba8053ecc3224660d",
		"job_id": "q7PLUPL25UV0z5Ij14IyMk8htXbj",
		"target": "fcb24954b88d0600",
		"height": 152,
		"seed_hash": "a4244aa43ddd6e3ef9e64bb80f4ee952f68232aa008d3da9c78e3b627e5675c8"
	}
}
```

### submit
Miner sends `submit` request after a share is found. The nonce is 8 bytes long, and found in position `[39..43]` (same as Cryptonote).

Pools or mining proxies can overwrite the `nonce_extra` (16 bytes long, starts from the 9th byte, so it's in position `[8..24]`) to reuse the same Stratum connection for multiple miners. This allows the pool software to serve thousands of miners with only 1 Stratum connection, each miner should have a different nonce extra to prevent collisions during mining. 

#### Example request:
```json
{
	"id": 2,
	"jsonrpc": "2.0",
	"method": "submit",
	"params": {
		"id": "1be0b7b6-b15a-47be-a17d-46b2911cf7d0",
		"job_id": "4BiGm3/RgGQzgkTI/xV0smdA+EGZ",
		"nonce": "d0030040",
		"nonce_extra": "f96aa0fa12cd362e9dcdb01675043a22",
		// "result" is the PoW hash
		"result": "e1364b8782719d7683e2ccd3d8f724bc59dfa780a9e960e7c0e0046acdb40100"
	}
}
```
#### Example success reply:
```json
{
	"id": 2,
	"jsonrpc": "2.0",
	"error": null,
	"result": {
		"status": "OK",
		// "blocks" is a list of found blocks, one for each chain. Useful for mining pools.
		// The node sends this info to connected miners, but it's not mandatory for pools
		// to send it to miners.
		"blocks": [
			{
				"hash": "9cf79541701d9f7da52581fe6221dbfec0c8c328dc74b0536ca521d479a90fb0",
				"height": 1521,
				// "network_id" indicates which chain this block belongs to.
				// The value of the network_id is printed when you start the node,
				// otherwise it can be found in the config/config_mainnet.go source code file
				"network_id": 5400199619762955418,
				"difficulty": 5323112,
				"ok": true,
			},
			{
				"hash": "d72d6fa206729f541b1f8d71561a4d139f2f1f0cb4bfaebde7857c3215afbcc1",
				"height": 52,
				"network_id": 4982253289762955418,
				"difficulty": 5221,
				"ok": true,
			}
		]
	}
}
```
