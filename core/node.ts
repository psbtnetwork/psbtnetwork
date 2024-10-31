import ecc from "@bitcoinerlab/secp256k1";
import url from "url";
import { initEccLib, Psbt, Signer } from "bitcoinjs-lib";
import { readFileSync } from "fs";
import { createServer, Server } from "http";
import { createServer as httpsServer } from "https";
import { WebSocketServer, WebSocket } from "ws";
import { createKeypair } from "./create-keypair";
import { tweakSigner } from "./tweak-signer";
import { randomUUID } from "crypto";
export type ModuleHandler = {
  update: (psbt: Psbt) => Promise<Psbt>;
  validate: (psbt: Psbt) => Promise<boolean>;
  sign: (psbt: Psbt, signer: Signer, tweakedSigner: Signer) => Promise<Psbt>;
  broadcast: (psbt: Psbt) => Promise<void>;
};
export type Module = {
  client: ModuleHandler;
  network: ModuleHandler;
  relay: ModuleHandler;
};
export type SocketHandler = {
  onMessage: (data: Psbt) => void;
};
export type NodeParams = {
  port: string;
  cert: string;
  key: string;
  networks: string[];
  privkey: string;
  modules: Module[];
  wss: SocketHandler;
  ws: SocketHandler;
};
export const node = (params: Partial<NodeParams>) => {
  initEccLib(ecc);
  const signer = createKeypair(params.privkey);
  const tweakedSigner = tweakSigner(signer);
  let channels = new Map<string, string>();
  let server: Server | null = null;
  let sockets: WebSocket[] = [];
  let wss: WebSocketServer | null = null;
  if (params.networks) {
    for (let i = 0; i < params.networks.length; i++) {
      let ws = new WebSocket(params.networks[i]);
      ws.on("message", async (data) => {
        for (let z = 0; z < (params.modules?.length || 0); z++) {
          let psbt = Psbt.fromBuffer(data as Buffer);
          params.ws?.onMessage(psbt);
          const relay = params.networks?.[i].includes("relay");
          const client = params.networks?.[i].includes("client");
          if (relay) {
            try {
              psbt = (await params.modules?.[z].relay.update(psbt)) || psbt;
              if (!(await params.modules?.[z].relay.validate(psbt))) return;
              psbt =
                (await params.modules?.[z].relay.sign(
                  psbt,
                  signer,
                  tweakedSigner
                )) || psbt;
              await params.modules?.[z].relay.broadcast(psbt);
              ws?.send(psbt.toBuffer());
            } catch {
              return;
            }
          }
          if (client) {
            try {
              if (!(await params.modules?.[z].client.validate(psbt))) return;
              psbt =
                (await params.modules?.[z].client.sign(
                  psbt,
                  signer,
                  tweakedSigner
                )) || psbt;
              await params.modules?.[z].client.broadcast(psbt);
            } catch {
              return;
            }
          }
        }
      });
      sockets?.push(ws);
    }
  }
  if (params.port) {
    if (params.cert && params.key) {
      server = httpsServer({
        cert: readFileSync(params.cert),
        key: readFileSync(params.key),
      });
    } else {
      server = createServer();
    }
    wss = new WebSocketServer({ server });
    wss.on(
      "connection",
      (ws: WebSocket & { uid: string; role: string }, req) => {
        const parameters = url.parse(req.url || "", true);
        ws.uid = randomUUID();
        ws.role = parameters.query?.role?.toString() || "";
        ws.on("message", async (data) => {
          for (let z = 0; z < (params.modules?.length || 0); z++) {
            let psbt = Psbt.fromBuffer(data as Buffer);
            params.wss?.onMessage(psbt);
            if (ws.role === "relay") {
              try {
                if (!(await params.modules?.[z].network.validate(psbt))) return;
                await params.modules?.[z].network.sign(
                  psbt,
                  signer,
                  tweakedSigner
                );
                await params.modules?.[z].network.broadcast(psbt);
                const uid = channels.get(ws.uid);
                if (!uid) return;
                wss?.clients.forEach((_client) => {
                  const client = _client as WebSocket & {
                    uid: string;
                    role: string;
                  };
                  if (
                    client.role === "client" &&
                    client.uid === uid &&
                    client.uid !== ws.uid
                  ) {
                    for (let channel of channels.entries()) {
                      if (channel[1] === ws.uid) {
                        channels.delete(channel[0]);
                      }
                    }
                    client.send(psbt.toBuffer());
                  }
                });
              } catch (e) {
                return;
              }
            } else if (ws.role === "client") {
              try {
                let psbt = Psbt.fromBuffer(data as Buffer);
                psbt = (await params.modules?.[z].network.update(psbt)) || psbt;
                wss?.clients.forEach((_client) => {
                  const client = _client as WebSocket & {
                    uid: string;
                    role: string;
                  };
                  if (client.role === "relay" && client.uid !== ws.uid) {
                    channels.set(client.uid, ws.uid);
                    client.send(psbt.toBuffer());
                  }
                });
              } catch (e) {
                return;
              }
            }
          }
        });
      }
    );
    server.listen(params.port);
  }
  const request = async (index: number = 0) => {
    let psbt = new Psbt();
    psbt = (await params.modules?.[index].client.update(psbt)) || psbt;
    for (let i = 0; i < sockets.length; i++) {
      new Promise<void>((res, rej) => {
        const ws = sockets[i];
        ws?.send(psbt.toBuffer(), (err) => {
          if (err) return rej(err);
          res();
        });
      });
    }
    return psbt;
  };
  return {
    signer,
    tweakedSigner,
    server,
    sockets,
    wss,
    request,
  };
};
