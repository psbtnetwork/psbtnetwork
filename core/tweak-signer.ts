import { ECPairFactory, ECPairInterface } from "ecpair";
import secp from "@bitcoinerlab/secp256k1";
import { initEccLib, Signer } from "bitcoinjs-lib";
import { tapTweakHash } from "./tap-tweak-hash";
import { toXOnly } from "./to-x-only";
export const tweakSigner = (
  keypair: ECPairInterface,
  init = initEccLib,
  factory = ECPairFactory,
  ecc = secp
): Signer => {
  init(ecc);
  const ECPair = factory(ecc);
  if (!keypair.privateKey) {
    throw new Error("Signer private key not found");
  }
  let privateKey = keypair.privateKey;
  if (keypair.publicKey[0] === 3) {
    privateKey = ecc.privateNegate(keypair.privateKey);
  }
  const tweakedPrivateKey = ecc.privateAdd(
    privateKey,
    tapTweakHash(toXOnly(keypair.publicKey))
  );
  if (!tweakedPrivateKey) {
    throw new Error("Invalid tweaked signer");
  }
  return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey));
};
