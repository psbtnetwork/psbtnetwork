import { Psbt } from "bitcoinjs-lib";
import { module } from "./module.mock.spec";
import { node } from "./node";
const privkey =
  "4b470312d51a6384524c330fd23a6e566d2d6f2d99ff06b5e69b74332eb330e3";
describe("node", () => {
  let networkWssMessage: Psbt | null = null;
  let networkWsMessage: Psbt;
  let network: ReturnType<typeof node>;
  let relayWsMessage: Psbt;
  let relay: ReturnType<typeof node>;
  let clienWsMessage: Psbt;
  let client: ReturnType<typeof node>;
  it("creates network", async () => {
    network = node({
      privkey,
      port: "9999",
      modules: [module],
      wss: {
        onMessage: (data) => {
          networkWssMessage = data;
        },
      },
      ws: {
        onMessage: (data) => {
          networkWsMessage = data;
        },
      },
    });
    await new Promise<void>((res) => {
      network.wss?.on("listening", () => {
        res();
      });
    });
    expect(network.server?.listening).toBeTruthy();
  });
  it("creates and connects relay", async () => {
    relay = node({
      privkey,
      networks: ["ws://localhost:9999?role=relay"],
      modules: [module],
      ws: {
        onMessage: (data) => {
          relayWsMessage = data;
        },
      },
    });
    await new Promise<void>((res) => {
      relay.sockets[0]?.on("open", () => {
        res();
      });
    });
    expect(relay.sockets[0]?.readyState).toEqual(1);
  });
  it("creates and connects client", async () => {
    client = node({
      privkey,
      networks: ["ws://localhost:9999?role=client"],
      modules: [module],
      ws: {
        onMessage: (data) => {
          clienWsMessage = data;
        },
      },
    });
    await new Promise<void>((res) => {
      client.sockets[0]?.on("open", () => {
        res();
      });
    });
    expect(client.sockets[0]?.readyState).toEqual(1);
  });
  it("client requests psbt to the network and receives it back with a response from relay and network", async () => {
    await client.request();
    while (!networkWssMessage) {
      await new Promise<void>((res) => setTimeout(() => res(), 100));
    }
    let psbt = await module.client.update(new Psbt());
    psbt = await module.network.update(psbt);
    psbt = await module.relay.update(psbt);
    expect(await module.relay.validate(psbt)).toBeTruthy();
    psbt = await module.relay.sign(psbt, relay.signer, relay.tweakedSigner);
    await module.relay.broadcast(psbt);
    expect(relayWsMessage.toHex()).toEqual(psbt.toHex());
    expect(await module.network.validate(psbt)).toBeTruthy();
    psbt = await module.network.sign(
      psbt,
      network.signer,
      network.tweakedSigner
    );
    await module.network.broadcast(psbt);
    expect(networkWssMessage.toHex()).toEqual(psbt.toHex());
    expect(await module.client.validate(psbt)).toBeTruthy();
    psbt = await module.client.sign(psbt, client.signer, client.tweakedSigner);
    await module.client.broadcast(psbt);
    expect(clienWsMessage.toHex()).toEqual(psbt.toHex());
    networkWssMessage = null;
  });
  it("closes client", async () => {
    await new Promise<void>((res) => {
      client.sockets[0]?.on("close", () => {
        res();
      });
      client.sockets[0]?.close();
    });
    expect(client.sockets[0]?.readyState).toEqual(3);
  });
  it("closes relay", async () => {
    await new Promise<void>((res) => {
      relay.sockets[0]?.on("close", () => {
        res();
      });
      relay.sockets[0]?.close();
    });
    expect(relay.sockets[0]?.readyState).toEqual(3);
  });
  it("closes network", async () => {
    await new Promise<void>((res) => {
      network.server?.on("close", () => {
        res();
      });
      network.server?.close();
    });
    expect(network.server?.listening).toBeFalsy();
  });
});
