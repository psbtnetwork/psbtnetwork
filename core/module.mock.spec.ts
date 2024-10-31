import { payments, Psbt, Signer } from "bitcoinjs-lib";
import { Module } from "./node";
import { toXOnly } from "./to-x-only";
export const module: Module = {
  client: {
    update: async () => {
      const psbt = new Psbt();
      const taproot = payments.p2tr({
        internalPubkey: toXOnly(
          Buffer.from(
            "02a18cbf149b01fccba4bb92d3ddece5d1d75043515e8bb0f64dd5bf4923a9d5df",
            "hex"
          )
        ),
      });
      const script = taproot.output!;
      psbt.addInput({
        hash: "b1cadc2d8771a7c6908c36b65b7561585aa3c047afb1c07b0b0b5f38f7f5026f",
        index: 1,
        nonWitnessUtxo: Buffer.from(
          "02000000000102c77c04b05843dfe9e747491f41d9411492e39fc21bf999ccb7c5a767b3f97a590100000000fdffffffc77c04b05843dfe9e747491f41d9411492e39fc21bf999ccb7c5a767b3f97a590300000000fdffffff04220200000000000022512024402c3f69d232d0dc57086ab9f42f12049e7ca470b586086ce83b7044ba82f72202000000000000225120ca28c42804720a2483d40b4fa70835b3c4778853e121a49abb0ec0f12831a3df0000000000000000276a0150015403018c6e00000931303030303030303003018c6e00510b3934383939353030303030bf80000000000000225120ca28c42804720a2483d40b4fa70835b3c4778853e121a49abb0ec0f12831a3df014025b309dd60d03ff7786407e4755c603be6a33ff944005374a69f970a4189256486faa6025a8c32474a465154202cadfc99e115f1d35da9e0337b2acca358ce950140b25e1e624134e1f5ad45235814aad6f7ea273a9bebb0d84aaaf21163dead186c9d2b8af2ff50ae665122d61eca67e2ae6c8fcb26183be91dd82e045d1c11399200000000",
          "hex"
        ),
        witnessUtxo: {
          value: 0n,
          script,
        },
        tapInternalKey: Buffer.from(
          toXOnly(
            Buffer.from(
              "02a18cbf149b01fccba4bb92d3ddece5d1d75043515e8bb0f64dd5bf4923a9d5df",
              "hex"
            )
          )
        ),
      });
      psbt.addOutput({
        address:
          "bc1peg5vg2qywg9zfq75pd86wzp4k0z80zznuys6fx4mpmq0z2p3500snwun6y",
        value: 0n,
      });
      return psbt;
    },
    validate: async (psbt: Psbt) => {
      if (psbt.data.inputs.length === 2 && psbt.data.outputs.length === 3) {
        return true;
      } else {
        return false;
      }
    },
    sign: async (psbt: Psbt, signer: Signer, tweakedSigner: Signer) => {
      // here you can use web wallets if needed extracting psbt and signing with their methods psbt.toHex()
      psbt.signInput(0, tweakedSigner);
      return psbt;
    },
    broadcast: async (psbt: Psbt) => {
      const tx = psbt.finalizeAllInputs().extractTransaction();
      tx.toHex();
      // push tx using any api or your node
    },
  },
  network: {
    update: async (psbt: Psbt) => {
      psbt.addOutput({
        address:
          "bc1peg5vg2qywg9zfq75pd86wzp4k0z80zznuys6fx4mpmq0z2p3500snwun6y",
        value: 0n,
      });
      return psbt;
    },
    validate: async (psbt: Psbt) => {
      if (psbt.data.inputs.length === 2 && psbt.data.outputs.length === 3) {
        return true;
      } else {
        return false;
      }
    },
    sign: async (psbt: Psbt) => {
      return psbt;
    },
    broadcast: async (psbt) => {},
  },
  relay: {
    update: async (psbt: Psbt) => {
      const taproot = payments.p2tr({
        internalPubkey: toXOnly(
          Buffer.from(
            "02a18cbf149b01fccba4bb92d3ddece5d1d75043515e8bb0f64dd5bf4923a9d5df",
            "hex"
          )
        ),
      });
      const script = taproot.output!;
      psbt.addInput({
        hash: "daff6437b181fd5c25e6a50d595091666d43786d7b72abf3e54cb6086ece7341",
        index: 0,
        nonWitnessUtxo: Buffer.from(
          "020000000001035c3d3c231a4092f2001aacc79daf6fe20174fe74785576a4006a1cac13b837160000000000fdffffffd59a6222c5c315ab0d929cb9e37a62a8213ca2dc403b2a0760f7c133329f58cd0000000000fdfffffff972159f1c016636e63d9c5604d478b3ba0f0e92737f59fc6ee6383b7c16e4540300000000fdffffff042202000000000000225120ca28c42804720a2483d40b4fa70835b3c4778853e121a49abb0ec0f12831a3df2202000000000000225120d9a8d10a6054f24028fd44d7720ab3326243a953941f752facdd5616350adbfd0000000000000000226a015001540305d91700000433652d370305d91700510b3939392e39393939393937a624000000000000225120d9a8d10a6054f24028fd44d7720ab3326243a953941f752facdd5616350adbfd01401f357f09a04643658d069679d495a78a5bd163bdf8302169548d9d22b5fab8f1673fcbc803d4d14c1b815d8e552ed2c4e8feba870b7825eca5335ac771680d2a01409e592f1908d08c22e67cee64454a39d3e14de6c927707a7648996b8e6c7bf09f092394d5e1ed102dc227c57fd32b3f2cd4adc7f05baaf7ab74981c0f2078f350014027a233db9f34b4aeefee999e9f91f4e5911c140f850b402f1c073eca2af9ff44d561cf7c9e88cf6356e52c6208c07ed88ec1f3954641aa09a01efbf6fed17d2800000000",
          "hex"
        ),
        witnessUtxo: {
          value: 0n,
          script,
        },
        tapInternalKey: Buffer.from(
          toXOnly(
            Buffer.from(
              "02a18cbf149b01fccba4bb92d3ddece5d1d75043515e8bb0f64dd5bf4923a9d5df",
              "hex"
            )
          )
        ),
      });
      psbt.addOutput({
        address:
          "bc1peg5vg2qywg9zfq75pd86wzp4k0z80zznuys6fx4mpmq0z2p3500snwun6y",
        value: 0n,
      });
      return psbt;
    },
    validate: async (psbt: Psbt) => {
      if (psbt.data.inputs.length === 2 && psbt.data.outputs.length === 3) {
        return true;
      } else {
        return false;
      }
    },
    sign: async (psbt: Psbt, signer: Signer, tweakedSigner: Signer) => {
      psbt.signInput(1, tweakedSigner);
      return psbt;
    },
    broadcast: async (psbt) => {},
  },
};
