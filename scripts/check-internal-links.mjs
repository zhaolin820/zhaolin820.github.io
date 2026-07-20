import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../_site/", import.meta.url));
const expectedArtifacts = [
  "index.html", "research.html", "publications.html", "software.html", "404.html",
  "robots.txt", "sitemap.xml", "data/publications.json",
  "data/publications.schema.json", "assets/images/favicon.svg",
  "assets/images/software/openairtwin-showcase.png"
];
const htmlFiles = [];
const errors = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(target);
    else if (entry.name.endsWith(".html")) htmlFiles.push(target);
  }
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch (error) {
    return false;
  }
}

for (const artifact of expectedArtifacts) {
  if (!(await exists(path.join(root, artifact)))) errors.push(`Missing build artifact: ${artifact}`);
}

await walk(root);
for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, "utf8");
  const attributes = html.matchAll(/\b(?:href|src)="([^"]+)"/g);
  for (const [, rawUrl] of attributes) {
    if (/^(?:https?:|mailto:|data:|#)/.test(rawUrl)) continue;

    const cleanUrl = rawUrl.split(/[?#]/, 1)[0];
    let target = cleanUrl.startsWith("/")
      ? path.join(root, cleanUrl)
      : path.resolve(path.dirname(htmlFile), cleanUrl);
    if (cleanUrl.endsWith("/")) target = path.join(target, "index.html");
    if (!(await exists(target))) {
      errors.push(`${path.relative(root, htmlFile)} references missing ${rawUrl}`);
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Checked internal links in ${htmlFiles.length} HTML files.`);
}
