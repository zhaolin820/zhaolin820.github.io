import { readFile } from "node:fs/promises";
import Ajv2020 from "ajv/dist/2020.js";

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const publications = await readJson("../data/publications.json");
const schema = await readJson("../data/publications.schema.json");
const research = await readJson("../src/_data/research.json");
const researchExtras = await readJson("../src/_data/researchExtras.json");
const news = await readJson("../src/_data/news.json");
const site = await readJson("../src/_data/site.json");
const software = await readJson("../src/_data/software.json");

const ajv = new Ajv2020({ allErrors: true });
ajv.addSchema(schema);
const validatePublications = ajv.getSchema(schema.$id);
const validatePublication = ajv.compile({ $ref: `${schema.$id}#/$defs/publication` });
const errors = [];

if (!validatePublications(publications)) {
  errors.push(...validatePublications.errors.map((error) => `publications${error.instancePath}: ${error.message}`));
}

for (const [index, item] of researchExtras.entries()) {
  if (!validatePublication(item)) {
    errors.push(...validatePublication.errors.map((error) => `researchExtras[${index}]${error.instancePath}: ${error.message}`));
  }
}

const publicItems = publications.categories.flatMap((category) => category.items);
const allItems = [...publicItems, ...researchExtras];
const ids = new Set();
const urlPattern = /^(https?:\/\/|mailto:)/;

if (publicItems.length !== 80) errors.push(`Expected 80 public publications, found ${publicItems.length}.`);
if (publicItems.filter((item) => item.is_first_author).length !== 22) errors.push("Expected 22 first-author publications.");
if (publicItems.filter((item) => !item.is_first_author).length !== 58) errors.push("Expected 58 co-author publications.");

for (const item of allItems) {
  if (ids.has(item.id)) errors.push(`Duplicate publication id across catalogs: ${item.id}`);
  ids.add(item.id);

  const expectedFirstAuthor = item.authors.startsWith("<b>Z. Wang</b>");
  if (item.is_first_author !== expectedFirstAuthor) {
    errors.push(`${item.id}: is_first_author does not match the author order.`);
  }
  if ((item.authors.match(/<b>Z\. Wang<\/b>/g) ?? []).length !== 1) {
    errors.push(`${item.id}: authors must mark Z. Wang exactly once.`);
  }
  if (item.authors.replaceAll("<b>", "").replaceAll("</b>", "").includes("<")) {
    errors.push(`${item.id}: authors contains unsupported HTML.`);
  }
}

for (const direction of research.directions ?? []) {
  if (!direction.id || !direction.title || !direction.summary || !direction.image || !direction.image_alt) {
    errors.push(`Research direction ${direction.id || "(missing id)"} is incomplete.`);
  }
  for (const group of direction.groups ?? []) {
    for (const id of group.publication_ids ?? []) {
      if (!ids.has(id)) errors.push(`Research group ${group.title} references unknown publication id: ${id}`);
    }
  }
}

for (let index = 0; index < news.length; index += 1) {
  const item = news[index];
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(item.date_iso)) errors.push(`News item ${index} has an invalid date.`);
  if (index > 0 && news[index - 1].date_iso < item.date_iso) errors.push("News items must be sorted newest first.");
  for (const segment of item.segments ?? []) {
    if (!segment.text && !segment.label) errors.push(`News item ${index} contains an empty segment.`);
    if (segment.label && segment.label !== segment.label.trim()) errors.push(`News item ${index} has an untrimmed link label.`);
    if (segment.url && !urlPattern.test(segment.url) && !segment.url.startsWith("/")) {
      errors.push(`News item ${index} has an invalid URL: ${segment.url}`);
    }
  }
}

for (const item of [...site.navigation, ...site.profiles]) {
  if (!item.url.startsWith("/") && !urlPattern.test(item.url)) errors.push(`Site data has an invalid URL: ${item.url}`);
}

for (const project of software.projects ?? []) {
  if (!project.id || !project.name || !project.tagline || !project.description || !project.image || !project.logo_light || !project.logo_dark) {
    errors.push(`Software project ${project.id || "(missing id)"} is incomplete.`);
  }
  if (!Array.isArray(project.features) || project.features.length === 0) {
    errors.push(`Software project ${project.id || "(missing id)"} has no features.`);
  }
  for (const field of ["repository", "tutorial", "architecture", "release"]) {
    if (!urlPattern.test(project[field] ?? "")) errors.push(`Software project ${project.id || "(missing id)"} has an invalid ${field} URL.`);
  }
}

function findUntrimmedStrings(value, path = "data") {
  if (typeof value === "string" && value !== value.trim()) errors.push(`${path} contains surrounding whitespace.`);
  if (Array.isArray(value)) value.forEach((item, index) => findUntrimmedStrings(item, `${path}[${index}]`));
  if (value && typeof value === "object" && !Array.isArray(value)) {
    Object.entries(value).forEach(([key, item]) => findUntrimmedStrings(item, `${path}.${key}`));
  }
}

findUntrimmedStrings(publications, "publications");
findUntrimmedStrings(research, "research");
findUntrimmedStrings(researchExtras, "researchExtras");
findUntrimmedStrings(site, "site");
findUntrimmedStrings(software, "software");

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${publicItems.length} public publications, ${researchExtras.length} research-only references, and ${news.length} news items.`);
}
