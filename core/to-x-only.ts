export const toXOnly = (pubkey: Uint8Array): Uint8Array =>
  pubkey.length === 32 ? pubkey : pubkey.subarray(1, 33);
