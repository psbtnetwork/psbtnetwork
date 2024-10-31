import { createKeypair, KeyPair } from "./create-keypair";
import { tweakSigner } from "./tweak-signer";
describe("tweak signer", () => {
  const keypair = createKeypair(
    "8e88820f8131067140753ebf4699205e7c70ebfab51c0e0ad6663c731498f351"
  );
  const tweakedPubkey =
    "020029edef1de53db1c51e9c0ba0dd9f9e40fcc08a6c449851d0d6593994424af2";
  it("returns tweaked signer", () => {
    let pair: KeyPair | undefined = undefined;
    while (pair ? pair.publicKey?.[0] !== 3 : true) {
      pair = createKeypair();
    }
    if (!pair) return;
    const signer0 = tweakSigner(pair);
    expect(() => tweakSigner({ ...pair, privateKey: undefined })).toThrow();
    expect(() =>
      tweakSigner(
        pair,
        () => ({} as any),
        () => ({} as any),
        {
          privateAdd: () => null as any,
          privateNegate: () =>
            "8e88820f8131067140753ebf4699205e7c70ebfab51c0e0ad6663c731498f351",
        } as any
      )
    ).toThrow("Invalid tweaked signer");
    expect(Buffer.from(signer0.publicKey).toString("hex")).toBeDefined();
    const signer1 = tweakSigner(keypair);
    expect(Buffer.from(signer1.publicKey).toString("hex")).toEqual(
      tweakedPubkey
    );
  });
});
