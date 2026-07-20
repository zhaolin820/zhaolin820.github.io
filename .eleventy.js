import nunjucks from "nunjucks";

const ALLOWED_AUTHOR_TAG = /(<\/?b>)/i;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatAuthors(value) {
  let isBold = false;
  const output = String(value ?? "")
    .split(new RegExp(ALLOWED_AUTHOR_TAG.source, "gi"))
    .map((token) => {
      const normalized = token.toLowerCase();
      if (normalized === "<b>") {
        isBold = true;
        return "";
      }
      if (normalized === "</b>") {
        isBold = false;
        return "";
      }

      const escaped = escapeHtml(token);
      return isBold && escaped ? `<strong>${escaped}</strong>` : escaped;
    })
    .join("");

  return new nunjucks.runtime.SafeString(output);
}

function arxivId(value) {
  try {
    const url = new URL(String(value));
    if (!/^(?:www\.)?arxiv\.org$/i.test(url.hostname)) return "";

    const match = url.pathname.match(/^\/(?:abs|pdf)\/([^/]+)$/i);
    return match ? match[1].replace(/\.pdf$/i, "") : "";
  } catch (error) {
    return "";
  }
}

function publicationYear(value) {
  return String(value ?? "").match(/^\d{4}/)?.[0] ?? "";
}

export default function (eleventyConfig) {
  const environment = new nunjucks.Environment(
    new nunjucks.FileSystemLoader("src/_includes"),
    { autoescape: true }
  );

  eleventyConfig.setLibrary("njk", environment);
  eleventyConfig.addPassthroughCopy({ assets: "assets" });
  eleventyConfig.addPassthroughCopy({ data: "data" });

  eleventyConfig.addFilter("formatAuthors", formatAuthors);
  eleventyConfig.addFilter("arxivId", arxivId);
  eleventyConfig.addFilter("publicationYear", publicationYear);
  eleventyConfig.addFilter("sortPublications", (items = []) =>
    [...items].sort((a, b) => b.date_iso.localeCompare(a.date_iso))
  );
  eleventyConfig.addFilter("authorGroup", (items = [], isFirstAuthor) =>
    items.filter((item) => item.is_first_author === isFirstAuthor)
  );
  eleventyConfig.addFilter("findPublication", (publications, id, researchExtras = []) => {
    for (const category of publications?.categories ?? []) {
      const match = category.items.find((item) => item.id === id);
      if (match) return match;
    }
    const extraMatch = researchExtras.find((item) => item.id === id);
    if (extraMatch) return extraMatch;
    throw new Error(`Unknown publication id referenced by research data: ${id}`);
  });
  eleventyConfig.addGlobalData("currentYear", () => new Date().getFullYear());

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
}
