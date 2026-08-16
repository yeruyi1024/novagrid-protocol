import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buf = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "buf.cmd" : "buf");
const cache = path.join(root, ".cache", "buf");
const environment = { ...process.env, BUF_CACHE_DIR: cache };

await mkdir(cache, { recursive: true });
await execFileAsync(buf, ["lint"], { cwd: root, env: environment });
await execFileAsync(buf, ["build"], { cwd: root, env: environment });
console.log("Protobuf lint 和构建通过");
