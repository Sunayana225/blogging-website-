import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const distDir = path.join(packageRoot, "dist", "public");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function resolveApiBaseUrl() {
  return (
    process.env.PRERENDER_API_BASE_URL ||
    process.env.API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://127.0.0.1:3000"
  );
}

async function fetchJson(apiBaseUrl, pathname) {
  const response = await fetch(new URL(pathname, apiBaseUrl));

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Request failed for ${pathname}: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`,
    );
  }

  return response.json();
}

function buildTextBlock(title, description, items) {
  const listItems = items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  return `
    <section>
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(description)}</p>
      <ul>${listItems}</ul>
    </section>
  `;
}

function renderDocument({ title, description, canonicalPath, body }) {
  const canonicalHref = canonicalPath === "/" ? "/" : canonicalPath.replace(/\/$/, "");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="${escapeHtml(canonicalHref)}" />
    <style>
      :root {
        color-scheme: light;
        --bg: #f7f4ee;
        --panel: #fffdf8;
        --text: #15211b;
        --muted: #5c6962;
        --accent: #246b4d;
        --accent-weak: #dce8df;
        --border: rgba(21, 33, 27, 0.12);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background:
          radial-gradient(circle at top left, rgba(36, 107, 77, 0.09), transparent 32%),
          linear-gradient(180deg, #faf7f1 0%, var(--bg) 100%);
        color: var(--text);
        line-height: 1.6;
      }
      a { color: inherit; }
      .page {
        max-width: 1120px;
        margin: 0 auto;
        padding: 48px 20px 80px;
      }
      .shell {
        background: rgba(255, 255, 255, 0.72);
        border: 1px solid var(--border);
        border-radius: 24px;
        box-shadow: 0 28px 80px rgba(21, 33, 27, 0.08);
        overflow: hidden;
      }
      header {
        padding: 28px 28px 0;
      }
      .eyebrow {
        display: inline-flex;
        gap: 8px;
        align-items: center;
        padding: 8px 14px;
        border-radius: 999px;
        background: var(--accent-weak);
        color: var(--accent);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      h1, h2, h3 {
        margin: 0;
        line-height: 1.1;
        font-family: Georgia, "Times New Roman", serif;
      }
      h1 { font-size: clamp(2.8rem, 5vw, 5.6rem); margin-top: 20px; }
      h2 { font-size: clamp(1.8rem, 2.2vw, 2.6rem); margin: 0 0 12px; }
      h3 { font-size: 1.3rem; }
      .lede {
        max-width: 72ch;
        font-size: 1.08rem;
        color: var(--muted);
        margin: 18px 0 0;
      }
      .content {
        padding: 28px;
      }
      .grid {
        display: grid;
        gap: 18px;
      }
      .cards { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
      .card {
        padding: 18px;
        border: 1px solid var(--border);
        border-radius: 18px;
        background: var(--panel);
      }
      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px 14px;
        color: var(--muted);
        font-size: 0.95rem;
        margin-top: 12px;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        border-radius: 999px;
        background: rgba(36, 107, 77, 0.08);
        color: var(--accent);
        font-size: 0.85rem;
        font-weight: 600;
      }
      .article {
        margin-top: 28px;
        padding-top: 24px;
        border-top: 1px solid var(--border);
      }
      .article-content {
        white-space: pre-wrap;
        font-size: 1.05rem;
        color: #203028;
      }
      .section {
        margin-top: 30px;
      }
      .foot {
        padding: 0 28px 28px;
        color: var(--muted);
        font-size: 0.95rem;
      }
      .topnav {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 18px;
      }
      .topnav a {
        text-decoration: none;
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.6);
      }
      .topnav a:hover { border-color: rgba(36, 107, 77, 0.32); }
      .muted { color: var(--muted); }
      .small { font-size: 0.95rem; }
      .backlink {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        color: var(--accent);
        font-weight: 600;
        margin-bottom: 18px;
      }
      .facts {
        margin: 0;
        padding-left: 18px;
      }
      .facts li + li { margin-top: 8px; }
      @media (max-width: 640px) {
        .page { padding-inline: 12px; }
        .shell { border-radius: 18px; }
        header, .content, .foot { padding-inline: 18px; }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <div class="shell">
        ${body}
      </div>
    </main>
  </body>
</html>`;
}

function renderCards(items, renderItem) {
  return `<div class="grid cards">${items.map(renderItem).join("")}</div>`;
}

function renderRootSummary({ featuredArticles, stats, articles, species }) {
  const topArticles = featuredArticles.slice(0, 3);
  const topSpecies = species.slice(0, 3);

  return `
    <section id="prerender-summary" style="display:none">
      ${buildTextBlock(
        "Wildleaf Journal",
        "A nature writing platform with essays, species profiles, and published work.",
        [
          `Total articles: ${stats.total}`,
          `Featured articles: ${stats.featuredCount}`,
          `Total views: ${stats.totalViews}`,
          ...topArticles.map((article) => `${article.title} — ${article.excerpt}`),
          ...topSpecies.map((item) => `${item.commonName} (${item.scientificName}) — ${item.description || ""}`),
        ],
      )}
    </section>
  `;
}

function renderHomePage({ featuredArticles, stats }) {
  return renderDocument({
    title: "Wildleaf Journal | Nature Writing",
    description: "Essays, field notes, species profiles, and published work from the natural world.",
    canonicalPath: "/",
    body: `
      <header>
        <span class="eyebrow">Nature Writing Platform</span>
        <h1>Wildleaf Journal</h1>
        <p class="lede">Essays, field notes, species profiles, and published work from the natural world.</p>
        <nav class="topnav" aria-label="Primary">
            <a href="/">Home</a>
            <a href="/articles/">Articles</a>
            <a href="/species/">Species</a>
          </nav>
      </header>
      <div class="content">
        <section class="section">
          <h2>What this site covers</h2>
          <div class="grid cards">
            <div class="card"><span class="pill">Articles</span><h3>${escapeHtml(stats.total)}</h3><p class="muted small">Published essays and field notes.</p></div>
            <div class="card"><span class="pill">Featured</span><h3>${escapeHtml(stats.featuredCount)}</h3><p class="muted small">Highlighted pieces on the front page.</p></div>
            <div class="card"><span class="pill">Views</span><h3>${escapeHtml(stats.totalViews)}</h3><p class="muted small">Aggregate readership across the archive.</p></div>
          </div>
        </section>
        <section class="section">
          <h2>Featured writing</h2>
          ${renderCards(featuredArticles.slice(0, 6), (article) => `
            <article class="card">
              <span class="pill">${escapeHtml(article.category)}</span>
              <h3 style="margin-top:12px">${escapeHtml(article.title)}</h3>
              <p class="muted small">${escapeHtml(article.excerpt)}</p>
              <div class="meta">
                <span>${escapeHtml(formatDate(article.publishedAt))}</span>
                <span>${escapeHtml(article.readTime)} min read</span>
                <span>${escapeHtml(article.viewCount)} views</span>
              </div>
            </article>
          `)}
        </section>
      </div>
      <div class="foot">Direct route pages are prerendered during the build so crawlers and humans can extract the site content without executing the SPA.</div>
    `,
  });
}

function renderArticlesIndex({ articles, categories }) {
  return renderDocument({
    title: "Articles | Wildleaf Journal",
    description: "Browse the full archive of essays and field notes.",
    canonicalPath: "/articles/",
    body: `
      <header>
        <a class="backlink" href="/">← Back to home</a>
        <span class="eyebrow">Archive</span>
        <h1>Essays & Field Notes</h1>
        <p class="lede">An archive of dispatches from the natural world, written for readers who want the content to be present in the page itself.</p>
        <nav class="topnav" aria-label="Article categories">
          ${categories.map((category) => `<span>${escapeHtml(category.name)}</span>`).join("")}
        </nav>
      </header>
      <div class="content">
        ${renderCards(articles, (article) => `
          <article class="card">
            <span class="pill">${escapeHtml(article.category)}</span>
            <h3 style="margin-top:12px"><a href="/articles/${escapeHtml(article.slug)}/">${escapeHtml(article.title)}</a></h3>
            <p class="muted small">${escapeHtml(article.excerpt)}</p>
            <div class="meta">
              <span>${escapeHtml(formatDate(article.publishedAt))}</span>
              <span>${escapeHtml(article.readTime)} min read</span>
              <span>${escapeHtml(article.tags?.length || 0)} tags</span>
            </div>
          </article>
        `)}
      </div>
    `,
  });
}

function renderArticleDetail(article) {
  const paragraphs = String(article.content || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");

  return renderDocument({
    title: `${article.title} | Wildleaf Journal`,
    description: article.seoDescription || article.excerpt,
    canonicalPath: `/articles/${article.slug}/`,
    body: `
      <header>
        <a class="backlink" href="/articles/">← Back to articles</a>
        <span class="eyebrow">${escapeHtml(article.category)}</span>
        <h1>${escapeHtml(article.title)}</h1>
        <p class="lede">${escapeHtml(article.excerpt)}</p>
        <div class="meta">
          <span>${escapeHtml(formatDate(article.publishedAt))}</span>
          <span>${escapeHtml(article.readTime)} min read</span>
          <span>${escapeHtml(article.viewCount)} views</span>
        </div>
      </header>
      <div class="content">
        ${article.imageUrl ? `<div class="card"><img src="${escapeHtml(article.imageUrl)}" alt="${escapeHtml(article.imageAlt || article.title)}" style="width:100%;height:auto;display:block;border-radius:12px" /></div>` : ""}
        <article class="article">
          <div class="article-content">${paragraphs || `<p>${escapeHtml(article.excerpt)}</p>`}</div>
        </article>
        ${article.tags?.length ? `
          <section class="section">
            <h2>Tags</h2>
            <div class="topnav">${article.tags.map((tag) => `<span class="pill">${escapeHtml(tag.name)}</span>`).join("")}</div>
          </section>
        ` : ""}
      </div>
    `,
  });
}

function renderSpeciesIndex({ species }) {
  return renderDocument({
    title: "Species | Wildleaf Journal",
    description: "Browse species profiles and conservation notes.",
    canonicalPath: "/species/",
    body: `
      <header>
        <a class="backlink" href="/">← Back to home</a>
        <span class="eyebrow">Species</span>
        <h1>Species Spotlight</h1>
        <p class="lede">Profiles of plants, animals, and fungi with conservation status, habitat, and field notes.</p>
      </header>
      <div class="content">
        ${renderCards(species, (item) => `
          <article class="card">
            <span class="pill">${escapeHtml(item.kingdom || "Species")}</span>
            <h3 style="margin-top:12px"><a href="/species/${escapeHtml(item.slug)}/">${escapeHtml(item.commonName)}</a></h3>
            <p class="muted small"><em>${escapeHtml(item.scientificName)}</em></p>
            <p class="muted small">${escapeHtml(item.description || item.habitat || "")}</p>
            <div class="meta">
              <span>${escapeHtml(item.conservationStatus || "Unknown")}</span>
              <span>${escapeHtml(item.habitat || "No habitat listed")}</span>
            </div>
          </article>
        `)}
      </div>
    `,
  });
}

function renderSpeciesDetail(species) {
  const funFacts = String(species.funFacts || "")
    .split(/\n+/)
    .map((fact) => fact.trim())
    .filter(Boolean);

  return renderDocument({
    title: `${species.commonName} | Wildleaf Journal`,
    description: species.description || species.habitat || species.commonName,
    canonicalPath: `/species/${species.slug}/`,
    body: `
      <header>
        <a class="backlink" href="/species/">← Back to species</a>
        <span class="eyebrow">${escapeHtml(species.conservationStatus || "Profile")}</span>
        <h1>${escapeHtml(species.commonName)}</h1>
        <p class="lede"><em>${escapeHtml(species.scientificName)}</em></p>
      </header>
      <div class="content">
        ${species.imageUrl ? `<div class="card"><img src="${escapeHtml(species.imageUrl)}" alt="${escapeHtml(species.commonName)}" style="width:100%;height:auto;display:block;border-radius:12px" /></div>` : ""}
        <section class="section">
          <div class="grid cards">
            <div class="card"><span class="pill">Kingdom</span><h3 style="margin-top:12px">${escapeHtml(species.kingdom || "—")}</h3></div>
            <div class="card"><span class="pill">Class</span><h3 style="margin-top:12px">${escapeHtml(species.speciesClass || "—")}</h3></div>
            <div class="card"><span class="pill">Order</span><h3 style="margin-top:12px">${escapeHtml(species.orderName || "—")}</h3></div>
            <div class="card"><span class="pill">Family</span><h3 style="margin-top:12px">${escapeHtml(species.family || "—")}</h3></div>
          </div>
        </section>
        <section class="section">
          <h2>About</h2>
          <p>${escapeHtml(species.description || "No description available.")}</p>
        </section>
        ${(species.habitat || species.geographicRange || species.diet) ? `
          <section class="section">
            <h2>Field Notes</h2>
            <div class="grid cards">
              ${species.habitat ? `<div class="card"><span class="pill">Habitat</span><p>${escapeHtml(species.habitat)}</p></div>` : ""}
              ${species.geographicRange ? `<div class="card"><span class="pill">Range</span><p>${escapeHtml(species.geographicRange)}</p></div>` : ""}
              ${species.diet ? `<div class="card"><span class="pill">Diet</span><p>${escapeHtml(species.diet)}</p></div>` : ""}
            </div>
          </section>
        ` : ""}
        ${funFacts.length ? `
          <section class="section">
            <h2>Fun Facts</h2>
            <ul class="facts">${funFacts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join("")}</ul>
          </section>
        ` : ""}
        ${species.iucnUrl ? `<section class="section"><p><a href="${escapeHtml(species.iucnUrl)}">View on IUCN Red List</a></p></section>` : ""}
      </div>
    `,
  });
}

// Portfolio pages removed — prerender no longer includes portfolio index

async function writePage(routeSegments, html) {
  const targetDir = path.join(distDir, ...routeSegments);
  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, "index.html"), html, "utf8");
}

async function main() {
  const apiBaseUrl = resolveApiBaseUrl();

  const [featuredArticles, stats, articlesPayload, categories, species] =
    await Promise.all([
      fetchJson(apiBaseUrl, "/api/articles/featured"),
      fetchJson(apiBaseUrl, "/api/articles/stats"),
      fetchJson(apiBaseUrl, "/api/articles"),
      fetchJson(apiBaseUrl, "/api/categories"),
      fetchJson(apiBaseUrl, "/api/species"),
    ]);

  const articles = articlesPayload.articles;

  await mkdir(distDir, { recursive: true });

  const rootIndexPath = path.join(distDir, "index.html");
  const rootIndexHtml = await readFile(rootIndexPath, "utf8");
  const hiddenSummary = renderRootSummary({
    featuredArticles,
    stats,
    articles,
    species,
  });

  const updatedRootIndexHtml = rootIndexHtml.includes('<div id="root"></div>')
    ? rootIndexHtml.replace('<div id="root"></div>', `${hiddenSummary}\n    <div id="root"></div>`)
    : rootIndexHtml.replace("</body>", `${hiddenSummary}</body>`);

  await writeFile(rootIndexPath, updatedRootIndexHtml, "utf8");

  await writePage([], renderHomePage({ featuredArticles, stats }));
  await writePage(["articles"], renderArticlesIndex({ articles, categories }));
  await writePage(["species"], renderSpeciesIndex({ species }));

  await Promise.all(
    articles.map(async (article) => {
      const fullArticle = await fetchJson(apiBaseUrl, `/api/articles/${encodeURIComponent(article.slug)}`);
      await writePage(["articles", article.slug], renderArticleDetail(fullArticle));
    }),
  );

  await Promise.all(
    species.map(async (item) => {
      const fullSpecies = await fetchJson(apiBaseUrl, `/api/species/${encodeURIComponent(item.slug)}`);
      await writePage(["species", item.slug], renderSpeciesDetail(fullSpecies));
    }),
  );

  console.log(
    `Prerendered ${articles.length} articles and ${species.length} species using ${apiBaseUrl}`,
  );
}

main().catch((error) => {
  console.error("Prerender failed:", error);
  process.exitCode = 1;
});