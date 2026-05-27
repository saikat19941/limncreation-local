import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

export async function createProductFolder(storageLocation: string, lcsin: string) {
  const targetPath = path.resolve(storageLocation, lcsin);
  await mkdir(targetPath, { recursive: true });
  return targetPath;
}

export async function deleteProductFolder(storageLocation: string, lcsin: string) {
  const rootPath = path.resolve(storageLocation);
  const targetPath = path.resolve(rootPath, lcsin);
  const relativeTarget = path.relative(rootPath, targetPath);

  if (
    !relativeTarget ||
    relativeTarget.startsWith("..") ||
    path.isAbsolute(relativeTarget)
  ) {
    throw new Error("Refusing to delete folder outside configured storage path.");
  }

  await rm(targetPath, {
    force: true,
    recursive: true,
  });

  return targetPath;
}
