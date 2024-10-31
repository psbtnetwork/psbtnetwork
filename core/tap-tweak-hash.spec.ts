import { tapTweakHash } from "./tap-tweak-hash";
describe("tap tweak hash", () => {
  const pubkey =
    "02dbf398abeebe792e42c4d8cba3b4d9f89ed9a20fac587e4476ff156ac06932d2";
  const tweakedHash =
    "f6323ca204d99c6957a67719dfd68171a2957ddc43ae63785f3330c2c01d6257";
  it("returns tweaked hash", () => {
    const hex = Buffer.from(tapTweakHash(Buffer.from(pubkey, "hex"))).toString(
      "hex"
    );
    expect(hex).toEqual(tweakedHash);
  });
});
