# 🔐 TLS & Mutual TLS (mTLS) in TypeScript

This repository demonstrates how to set up **TLS (one-way authentication)** and **mutual TLS (mTLS - two-way authentication)** using **TypeScript** and the Node.js `https` module.

## 🚀 Features

- **TLS Server & Client** → Secure server with HTTPS
- **mTLS Server & Client** → Mutual authentication with client certificates
- **Certificate Generation** → Using OpenSSL
- **Node.js HTTPS Integration**

---

## 📌 Prerequisites

- **Node.js** (v16+ recommended)
- **TypeScript**
- **OpenSSL** installed

To install OpenSSL:

```sh
sudo apt install openssl   # Ubuntu/Debian
brew install openssl       # macOS
```

---

## 🔹 1️⃣ Generate TLS Certificates

Run the following commands to create self-signed **server certificates**:

```sh
mkdir tls && cd tls
openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 365 -nodes -subj "/CN=localhost"
```

This will generate:

- `server.key` → Private key
- `server.crt` → Public certificate

---

## 🛠 2️⃣ Create a TLS Server & Client

### **🔹 TLS Server (`tls-server.ts`)**

```typescript
import https from "https";
import fs from "fs";

const options = {
  key: fs.readFileSync("tls/server.key"),
  cert: fs.readFileSync("tls/server.crt"),
};

const server = https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end("🔐 Secure Server Response");
});

server.listen(8443, () => {
  console.log("✅ TLS Server running on https://localhost:8443");
});
```

### **🔹 TLS Client (`tls-client.ts`)**

```typescript
import https from "https";

const options = {
  hostname: "localhost",
  port: 8443,
  rejectUnauthorized: false, // ⚠️ Only for self-signed certs
};

const req = https.request(options, (res) => {
  res.on("data", (d) => process.stdout.write(d));
});

req.end();
```

Run the server:

```sh
ts-node tls-server.ts
```

Run the client:

```sh
ts-node tls-client.ts
```

✅ **Expected Output (Client):**

```
🔐 Secure Server Response
```

---

## 🔹 3️⃣ Generate Certificates for Mutual TLS (mTLS)

Run the following commands to create **client & server certificates signed by a Certificate Authority (CA)**:

```sh
# Generate CA Key & Certificate
openssl req -x509 -newkey rsa:4096 -keyout tls/ca.key -out tls/ca.crt -days 365 -nodes -subj "/CN=MyRootCA"

# Generate Server Key & Certificate
openssl req -newkey rsa:4096 -keyout tls/server.key -out tls/server.csr -nodes -subj "/CN=localhost"
openssl x509 -req -in tls/server.csr -CA tls/ca.crt -CAkey tls/ca.key -CAcreateserial -out tls/server.crt -days 365

# Generate Client Key & Certificate
openssl req -newkey rsa:4096 -keyout tls/client.key -out tls/client.csr -nodes -subj "/CN=client"
openssl x509 -req -in tls/client.csr -CA tls/ca.crt -CAkey tls/ca.key -CAcreateserial -out tls/client.crt -days 365
```

---

## 🔹 4️⃣ Create an mTLS Server & Client

### **🔹 mTLS Server (`mtls-server.ts`)**

```typescript
import https from "https";
import fs from "fs";

const options = {
  key: fs.readFileSync("tls/server.key"),
  cert: fs.readFileSync("tls/server.crt"),
  ca: fs.readFileSync("tls/ca.crt"), // Trust CA
  requestCert: true, // Require client certificate
  rejectUnauthorized: true, // Verify client cert
};

const server = https.createServer(options, (req, res) => {
  if (req.socket.authorized) {
    res.writeHead(200);
    res.end("🔐 Secure mTLS Server Response: Client Verified!");
  } else {
    res.writeHead(401);
    res.end("❌ Client Certificate Not Verified");
  }
});

server.listen(8443, () => {
  console.log("✅ mTLS Server running on https://localhost:8443");
});
```

### **🔹 mTLS Client (`mtls-client.ts`)**

```typescript
import https from "https";
import fs from "fs";

const options = {
  hostname: "localhost",
  port: 8443,
  ca: fs.readFileSync("tls/ca.crt"),
  key: fs.readFileSync("tls/client.key"),
  cert: fs.readFileSync("tls/client.crt"),
  rejectUnauthorized: true,
};

const req = https.request(options, (res) => {
  res.on("data", (d) => process.stdout.write(d));
});

req.end();
```

Run the server:

```sh
ts-node mtls-server.ts
```

Run the client:

```sh
ts-node mtls-client.ts
```

✅ **Expected Output (Client):**

```
🔐 Secure mTLS Server Response: Client Verified!
```

---
