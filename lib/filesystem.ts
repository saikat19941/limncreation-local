import { mkdir } from "node:fs/promises";
import path from "node:path";

export async function createProductFolder(storageLocation: string, lcsin: string) {
  const targetPath = path.resolve(storageLocation, lcsin);
  await mkdir(targetPath, { recursive: true });
  return targetPath;
}
