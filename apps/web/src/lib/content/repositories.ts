import fs from "node:fs/promises";
import path from "node:path";
import { RepositoryPageSchema, type RepositoryPage } from "./schema";

const ROOT = path.join(process.cwd(), "..", "..", "content");

async function readJson(filePath: string) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function repositoryPagePath(repository: string) {
  return path.join(ROOT, "repositories", repository, "page.json");
}

export async function loadRepositoryPage(repository: string): Promise<RepositoryPage | null> {
  try {
    const pagePath = repositoryPagePath(repository);
    return RepositoryPageSchema.parse(await readJson(pagePath));
  } catch (error) {
    return null;
  }
}

export async function hasRepositoryPage(repository: string): Promise<boolean> {
  const pagePath = repositoryPagePath(repository);
  try {
    await fs.access(pagePath);
    return true;
  } catch {
    return false;
  }
}