export const COIN = 1_000_000_000
export const TICKER = "LDG"
export const TARGET_BLOCK_TIME = 15 // seconds

// Transaction fee: 2_000_000 atomic units per virtual byte
export const FEE_PER_BYTE_V2 = 2_000_000n

// LiteDAG network ID (written into signature field during tx signing)
export const NETWORK_ID = 0x4f2102a9dc2b9d81n
// Legacy mainnet ID — when NETWORK_ID !== this, signature field gets NETWORK_ID instead of zeros
export const LEGACY_MAINNET_NETWORK_ID = 0xd38dab1d4676d0c5n
