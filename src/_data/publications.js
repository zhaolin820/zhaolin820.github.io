import { readFileSync } from "node:fs";

export default JSON.parse(
  readFileSync(new URL("../../data/publications.json", import.meta.url), "utf8")
);
