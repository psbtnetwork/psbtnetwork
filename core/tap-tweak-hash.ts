import { crypto } from "bitcoinjs-lib";
export const tapTweakHash = (pubkey: Uint8Array): Uint8Array =>
  crypto.taggedHash("TapTweak", Buffer.concat([pubkey]));
