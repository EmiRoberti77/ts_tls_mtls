import https from "https";
import fs from "fs";
import path from "path";
import { hostname, port } from "./constants";

const options = {
  hostname,
  port,
  rejectUnauthorized: false, // only for self assigned
};

const req = https.request(options, (res) => {
  res.on("data", (d) => {
    process.stdout.write(d);
  });
});

req.on("error", (err) => {
  console.error(err);
});

req.end();
