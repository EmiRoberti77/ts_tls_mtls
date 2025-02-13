import https from "https";
import fs from "fs";
import path from "path";
import { port } from "./constants";

console.log(__dirname);
const options = {
  key: fs.readFileSync(path.join(__dirname, "tls_certificates", "server.key")),
  cert: fs.readFileSync(path.join(__dirname, "tls_certificates", "server.crt")),
};

const server = https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end("secure server response");
});

server.listen(port, () => {
  console.log("tls server running on https://localohost:443");
});
