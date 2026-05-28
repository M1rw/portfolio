import fs from "node:fs/promises";
import path from "node:path";
import { SiteConfigSchema, type SiteConfig } from "./schema";

const ROOT = path.join(process.cwd(), "..", "..", "content");

async function readJson(filePath: string) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

export async function loadSiteConfig(): Promise<SiteConfig> {
  const configPath = path.join(ROOT, "config.json");
  return SiteConfigSchema.parse(await readJson(configPath));
}