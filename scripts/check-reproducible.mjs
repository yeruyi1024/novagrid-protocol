import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buf = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "buf.cmd" : "buf");
const temporary = await mkdtemp(path.join(tmpdir(), "novagrid-protocol-"));
const environment = { ...process.env, BUF_CACHE_DIR: path.join(root, ".cache", "buf") };

try {
  const first = path.join(temporary, "first.binpb");
  const second = path.join(temporary, "second.binpb");
  await execFileAsync(buf, ["build", "-o", first], { cwd: root, env: environment });
  await execFileAsync(buf, ["build", "-o", second], { cwd: root, env: environment });
  const firstHash = createHash("sha256").update(await readFile(first)).digest("hex");
  const secondHash = createHash("sha256").update(await readFile(second)).digest("hex");
  if (firstHash !== secondHash) {
    throw new Error(`Protobuf 描述符不可再现：${firstHash} != ${secondHash}`);
  }
  console.log(`Protobuf 描述符可再现：sha256=${firstHash}`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
