import { readFile, writeFile } from "node:fs/promises";

const fileUrl = new URL("../data/publications.json", import.meta.url);
const monthNumbers = new Map([
  ["Jan", "01"], ["Feb", "02"], ["Mar", "03"], ["Apr", "04"],
  ["May", "05"], ["Jun", "06"], ["Jul", "07"], ["Aug", "08"],
  ["Sep", "09"], ["Oct", "10"], ["Nov", "11"], ["Dec", "12"]
]);
const displayMonths = new Map([
  ["Jan", "Jan."], ["Feb", "Feb."], ["Mar", "Mar."], ["Apr", "Apr."],
  ["May", "May"], ["Jun", "Jun."], ["Jul", "Jul."], ["Aug", "Aug."],
  ["Sep", "Sep."], ["Oct", "Oct."], ["Nov", "Nov."], ["Dec", "Dec."]
]);
const canonicalJournals = new Map([
  ["IEEE Communication Letters", "IEEE Communications Letters"],
  ["IEEE Wireless Communication Letters", "IEEE Wireless Communications Letters"]
]);

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function normalizeDate(value) {
  const match = String(value).trim().match(/^([A-Za-z]{3})[.,]?\s+(\d{4})$/);
  if (!match || !monthNumbers.has(match[1])) {
    throw new Error(`Unsupported publication date: ${value}`);
  }
  const [, month, year] = match;
  return {
    date: `${displayMonths.get(month)} ${year}`,
    date_iso: `${year}-${monthNumbers.get(month)}`
  };
}

const publicationData = JSON.parse(await readFile(fileUrl, "utf8"));
const usedIds = new Set();

for (const category of publicationData.categories) {
  category.type = category.type.trim();
  category.title = category.title.trim();

  for (const item of category.items) {
    for (const field of ["authors", "title", "main_link", "journal", "conference", "status"]) {
      if (typeof item[field] === "string") item[field] = item[field].trim();
    }

    item.id ||= slugify(item.title);
    if (!item.id || usedIds.has(item.id)) {
      throw new Error(`Duplicate or empty publication id: ${item.id || item.title}`);
    }
    usedIds.add(item.id);

    Object.assign(item, normalizeDate(item.date));
    item.is_first_author = item.authors.startsWith("<b>Z. Wang</b>");

    if (item.journal) {
      item.journal = canonicalJournals.get(item.journal) ?? item.journal;
    }
    if (Array.isArray(item.links)) {
      item.links = item.links.map((link) => ({
        text: /^arxiv$/i.test(link.text.trim()) ? "arXiv" : link.text.trim(),
        url: link.url.trim()
      }));
    }
    if (Array.isArray(item.notes)) {
      item.notes = item.notes.map((note) => ({
        type: note.type.trim(),
        text: note.text.trim()
      }));
    }
  }
}

await writeFile(fileUrl, `${JSON.stringify(publicationData, null, 2)}\n`);
console.log(`Normalized ${usedIds.size} publications.`);

