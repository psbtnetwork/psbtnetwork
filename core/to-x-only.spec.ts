import { createKeypair, KeyPair } from "./create-keypair";
import { toXOnly } from "./to-x-only";
describe("to x only", () => {
  let keypair: KeyPair;
  beforeAll(() => {
    keypair = createKeypair();
  });
  it("transforms pubkey", () => {
    expect(keypair.publicKey!.length).toEqual(33);
    expect(toXOnly(keypair.publicKey!).length).toEqual(32);
    expect(toXOnly(toXOnly(keypair.publicKey!)).length).toEqual(32);
  });
});
