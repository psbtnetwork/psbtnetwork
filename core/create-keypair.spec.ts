import { createKeypair, KeyPair } from "./create-keypair";
describe("create keypair", () => {
  let keypair: KeyPair;
  it("returns a random keypair", () => {
    keypair = createKeypair();
    expect(keypair.privateKey).toBeDefined();
  });
  it("returns keypair based on priv key", () => {
    const privkey = Buffer.from(keypair.privateKey!).toString("hex");
    const restoredKeypair = createKeypair(privkey);
    const restored = Buffer.from(restoredKeypair.privateKey!).toString("hex");
    expect(restored).toEqual(privkey);
  });
});
