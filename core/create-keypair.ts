import ecc from "@bitcoinerlab/secp256k1";
import { initEccLib } from "bitcoinjs-lib";
import { ECPairFactory, ECPairInterface } from "ecpair";
export type KeyPair = ECPairInterface;
export type CreateKeypair = (privateKey?: string) => KeyPair;
export const createKeypair: CreateKeypair = (privateKey) => {
  initEccLib(ecc);
  const ECPair = ECPairFactory(ecc);
  let keypair: ECPairInterface;
  if (privateKey) {
    keypair = ECPair.fromPrivateKey(Buffer.from(privateKey, "hex"));
  } else {
    keypair = ECPair.makeRandom();
  }
  return keypair;
};
