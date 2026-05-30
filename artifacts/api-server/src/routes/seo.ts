import { Router } from "express";
import { db } from "@workspace/db";
import { articlesTable, speciesTable, portfolioClipsTable } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";

const router = Router();

const SITE_NAME = "Wildleaf Journal";
const OWNER_NAME = "Sunayana Yakkala";
const OWNER_ALTERNATE_NAME = "Sunayana";
const DEFAULT_DESCRIPTION =
  "Wildleaf Journal is a nature writing platform with essays, field notes, and science stories designed to be discoverable in search.";
const SEO_KEYWORDS =
  "Sunayana, Sunayana Yakkala, Wildleaf Journal, nature writing, field notes, science stories, conservation writing";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function getSiteOrigin(req: Parameters<typeof router.get>[1] extends (...args: infer T) => unknown ? T[0] : never): string {
  const configured = process.env.SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;

  const forwardedProto = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || req.protocol;
  const host = req.get("x-forwarded-host")?.split(",")[0]?.trim() || req.get("host");
  return `${protocol}://${host}`;
}

function getOwnerJsonLd(origin: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${origin}/#sunayana-yakkala`,
    name: OWNER_NAME,
    alternateName: OWNER_ALTERNATE_NAME,
    url: `${origin}/about`,
    knowsAbout: ["nature writing", "field notes", "science stories", "conservation writing"],
  };
}

function getWebsiteJsonLd(origin: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    name: SITE_NAME,
    url: `${origin}/`,
    author: { "@id": `${origin}/#sunayana-yakkala` },
    publisher: { "@id": `${origin}/#sunayana-yakkala` },
    inLanguage: "en",
  };
}

function renderDocument(params: {
  req: Parameters<typeof router.get>[1] extends (...args: infer T) => unknown ? T[0] : never;
  title: string;
  description: string;
  path: string;
  body: string;
  type?: string;
  image?: string | null;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}) {
  const origin = getSiteOrigin(params.req);
  const canonical = `${origin}${params.path}`;
  const commonJsonLd = [getOwnerJsonLd(origin), getWebsiteJsonLd(origin)];
  const pageJsonLd = params.jsonLd
    ? (Array.isArray(params.jsonLd) ? params.jsonLd : [params.jsonLd])
    : [];
  const jsonLdItems = [...commonJsonLd, ...pageJsonLd];
  const jsonLdBlock = `<script type="application/ld+json">${escapeJson(jsonLdItems)}</script>`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(params.title)}</title>
    <meta name="description" content="${escapeHtml(params.description)}" />
    <meta name="author" content="${escapeHtml(OWNER_NAME)}" />
    <meta name="keywords" content="${escapeHtml(SEO_KEYWORDS)}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <link rel="author" href="${escapeHtml(origin)}/about" />
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
    <meta property="og:title" content="${escapeHtml(params.title)}" />
    <meta property="og:description" content="${escapeHtml(params.description)}" />
    <meta property="og:type" content="${escapeHtml(params.type ?? "website")}" />
    <meta property="article:author" content="${escapeHtml(OWNER_NAME)}" />
    ${params.image ? `<meta property="og:image" content="${escapeHtml(params.image)}" />` : ""}
    <meta name="twitter:card" content="${params.image ? "summary_large_image" : "summary"}" />
    <meta name="twitter:title" content="${escapeHtml(params.title)}" />
    <meta name="twitter:description" content="${escapeHtml(params.description)}" />
    ${params.image ? `<meta name="twitter:image" content="${escapeHtml(params.image)}" />` : ""}
    <style>
      :root { color-scheme: light; }
      body { margin: 0; font-family: Georgia, serif; background: #f8f6f0; color: #151515; }
      main { max-width: 900px; margin: 0 auto; padding: 48px 20px 72px; line-height: 1.65; }
      header { margin-bottom: 32px; padding-bottom: 20px; border-bottom: 1px solid #ddd7c6; }
      h1 { margin: 0 0 12px; font-size: clamp(2.3rem, 4vw, 4.6rem); line-height: 1.05; }
      h2 { margin-top: 2rem; font-size: 1.6rem; }
      .kicker { text-transform: uppercase; letter-spacing: 0.16em; font-size: 0.78rem; color: #6b5f49; margin: 0 0 14px; }
      .meta { color: #5f5a52; font-size: 0.96rem; margin-bottom: 24px; }
      .article-content p { margin: 0 0 1.1rem; }
      .article-content ul { padding-left: 1.25rem; }
      .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
      .card { background: #fff; border: 1px solid #e0d8c8; padding: 16px; border-radius: 14px; }
      .card h3 { margin: 0 0 8px; font-size: 1.1rem; }
      .card p { margin: 0; color: #5f5a52; }
      a { color: #0f5b45; }
      .footer-note { margin-top: 32px; color: #6b5f49; font-size: 0.92rem; }
    </style>
    ${jsonLdBlock}
  </head>
  <body>
    <main>${params.body}</main>
  </body>
</html>`;
}

function truncateText(text: string, maxLength = 160): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}...` : normalized;
}

function renderTextParagraphs(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim()).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

router.get("/robots.txt", (req, res) => {
  const origin = getSiteOrigin(req);
  res.type("text/plain").send(`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
});

router.get("/sitemap.xml", async (req, res, next) => {
  try {
    const origin = getSiteOrigin(req);

    const [articles, species] = await Promise.all([
      db.select({ slug: articlesTable.slug, updatedAt: articlesTable.updatedAt })
        .from(articlesTable)
        .where(eq(articlesTable.status, "published"))
        .orderBy(desc(articlesTable.publishedAt)),
      db.select({ slug: speciesTable.slug, updatedAt: speciesTable.createdAt })
        .from(speciesTable)
        .orderBy(desc(speciesTable.createdAt)),
    ]);

    const urls = [
      { path: "/", updatedAt: new Date() },
      { path: "/articles", updatedAt: new Date() },
      { path: "/about", updatedAt: new Date() },
      { path: "/contact", updatedAt: new Date() },
      { path: "/newsletter", updatedAt: new Date() },
      { path: "/portfolio", updatedAt: new Date() },
      { path: "/services", updatedAt: new Date() },
      { path: "/species", updatedAt: new Date() },
      ...articles.map((article) => ({ path: `/articles/${article.slug}`, updatedAt: article.updatedAt })),
      ...species.map((item) => ({ path: `/species/${item.slug}`, updatedAt: item.updatedAt })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls
        .map((entry) => {
          const lastmod = entry.updatedAt instanceof Date ? entry.updatedAt.toISOString() : new Date(entry.updatedAt).toISOString();
          return `  <url><loc>${origin}${entry.path}</loc><lastmod>${lastmod}</lastmod></url>`;
        })
        .join("\n") +
      `\n</urlset>\n`;

    res.type("application/xml").send(xml);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const [featured, stats] = await Promise.all([
      db.select().from(articlesTable)
        .where(eq(articlesTable.status, "published"))
        .orderBy(desc(articlesTable.featured), desc(articlesTable.publishedAt))
        .limit(3),
      db.select({ count: sql<number>`count(*)` }).from(articlesTable).where(eq(articlesTable.status, "published")),
    ]);

    const body = `
      <header>
        <p class="kicker">Wildleaf Journal</p>
        <h1>Nature writing, field notes, and science stories</h1>
        <p class="meta">${escapeHtml(DEFAULT_DESCRIPTION)}</p>
      </header>
      <section>
        <h2>Featured writing</h2>
        <div class="card-grid">
          ${featured.map((article) => `
            <article class="card">
              <h3><a href="/articles/${escapeHtml(article.slug)}">${escapeHtml(article.title)}</a></h3>
              <p>${escapeHtml(truncateText(article.excerpt))}</p>
            </article>
          `).join("")}
        </div>
      </section>
      <p class="footer-note">Published articles: ${Number(stats[0]?.count ?? 0)}. More content is available in the article archive.</p>
    `;

    const html = renderDocument({
      req,
      title: "Wildleaf Journal | Nature Writing, Field Notes, and Science Stories",
      description: DEFAULT_DESCRIPTION,
      path: "/",
      body,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: `${getSiteOrigin(req)}/`,
        author: { "@id": `${getSiteOrigin(req)}/#sunayana-yakkala` },
        publisher: { "@id": `${getSiteOrigin(req)}/#sunayana-yakkala` },
      },
    });

    res.type("text/html").send(html);
  } catch (error) {
    next(error);
  }
});

router.get("/articles", async (req, res, next) => {
  try {
    const articles = await db.select().from(articlesTable)
      .where(eq(articlesTable.status, "published"))
      .orderBy(desc(articlesTable.publishedAt))
      .limit(12);

    const body = `
      <header>
        <p class="kicker">Archive</p>
        <h1>Essays and field notes</h1>
        <p class="meta">Browse the latest published writing from Wildleaf Journal.</p>
      </header>
      <section class="card-grid">
        ${articles.map((article) => `
          <article class="card">
            <h3><a href="/articles/${escapeHtml(article.slug)}">${escapeHtml(article.title)}</a></h3>
            <p>${escapeHtml(truncateText(article.excerpt))}</p>
          </article>
        `).join("")}
      </section>
    `;

    res.type("text/html").send(renderDocument({
      req,
      title: "Wildleaf Journal | Essays & Field Notes",
      description: "Browse Wildleaf Journal's essays, field notes, and science writing archive.",
      path: "/articles",
      body,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Essays & Field Notes",
        url: `${getSiteOrigin(req)}/articles`,
        author: { "@id": `${getSiteOrigin(req)}/#sunayana-yakkala` },
        publisher: { "@id": `${getSiteOrigin(req)}/#sunayana-yakkala` },
      },
    }));
  } catch (error) {
    next(error);
  }
});

router.get("/articles/:slug", async (req, res, next) => {
  try {
    const [article] = await db.select().from(articlesTable).where(eq(articlesTable.slug, req.params.slug));
    if (!article || article.status !== "published") {
      res.status(404).type("text/html").send(renderDocument({
        req,
        title: "Wildleaf Journal | Article not found",
        description: DEFAULT_DESCRIPTION,
        path: req.path,
        body: `<header><p class="kicker">404</p><h1>Article not found</h1><p class="meta">The page you requested does not exist or is not published yet.</p></header>`,
      }));
      return;
    }

    const publishedDate = article.publishedAt ?? article.createdAt;
    const body = `
      <header>
        <p class="kicker">${escapeHtml(article.category)}</p>
        <h1>${escapeHtml(article.title)}</h1>
        <p class="meta">${escapeHtml(article.excerpt)}</p>
        <p class="meta">Published ${publishedDate.toISOString().slice(0, 10)} | ${article.readTime} min read</p>
      </header>
      <article class="article-content">
        ${renderTextParagraphs(article.content)}
      </article>
    `;

    res.type("text/html").send(renderDocument({
      req,
      title: `${article.seoTitle || article.title} | Wildleaf Journal`,
      description: article.seoDescription || truncateText(article.excerpt, 155),
      path: req.path,
      body,
      type: "article",
      image: article.imageUrl,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.seoDescription || article.excerpt,
        author: { "@id": `${getSiteOrigin(req)}/#sunayana-yakkala` },
        publisher: { "@id": `${getSiteOrigin(req)}/#sunayana-yakkala` },
        datePublished: publishedDate.toISOString(),
        dateModified: article.updatedAt.toISOString(),
        mainEntityOfPage: `${getSiteOrigin(req)}${req.path}`,
        image: article.imageUrl ? [article.imageUrl] : undefined,
      },
    }));
  } catch (error) {
    next(error);
  }
});

router.get("/about", (req, res) => {
  res.type("text/html").send(renderDocument({
    req,
    title: "Wildleaf Journal | About",
    description: "Learn more about Wildleaf Journal and the editorial mission behind the publication.",
    path: "/about",
    body: `<header><p class="kicker">About</p><h1>About the publication</h1><p class="meta">An editorial home for science writing, field notes, and ecological storytelling.</p></header><article class="article-content"><p>Wildleaf Journal publishes essays and reporting that bridge rigorous science with readable, discoverable prose.</p></article>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "About",
      author: { "@id": `${getSiteOrigin(req)}/#sunayana-yakkala` },
      publisher: { "@id": `${getSiteOrigin(req)}/#sunayana-yakkala` },
    },
  }));
});

router.get("/contact", (req, res) => {
  res.type("text/html").send(renderDocument({
    req,
    title: "Wildleaf Journal | Contact",
    description: "Get in touch with Wildleaf Journal for commissions, editorial work, and collaborations.",
    path: "/contact",
    body: `<header><p class="kicker">Contact</p><h1>Get in touch</h1><p class="meta">Use the contact form on the site for commissions and editorial inquiries.</p></header>`,
  }));
});

router.get("/newsletter", (req, res) => {
  res.type("text/html").send(renderDocument({
    req,
    title: "Wildleaf Journal | Newsletter",
    description: "Subscribe to Wildleaf Journal for essays, field notes, and updates from the archive.",
    path: "/newsletter",
    body: `<header><p class="kicker">Newsletter</p><h1>Field notes to your inbox</h1><p class="meta">Twice a month, readers receive essays, field observations, and recommended reading.</p></header>`,
  }));
});

router.get("/portfolio", async (req, res, next) => {
  try {
    const clips = await db.select().from(portfolioClipsTable).orderBy(desc(portfolioClipsTable.date)).limit(6);

    res.type("text/html").send(renderDocument({
      req,
      title: "Wildleaf Journal | Portfolio",
      description: "Explore Wildleaf Journal's selected portfolio pieces and published work.",
      path: "/portfolio",
      body: `<header><p class="kicker">Portfolio</p><h1>Selected work</h1><p class="meta">Published clips and recent commissions.</p></header><section class="card-grid">${clips.map((clip) => `<article class="card"><h3>${escapeHtml(clip.title)}</h3><p>${escapeHtml(truncateText(`${clip.publication} | ${clip.category}`))}</p></article>`).join("")}</section>`,
    }));
  } catch (error) {
    next(error);
  }
});

router.get("/services", (req, res) => {
  res.type("text/html").send(renderDocument({
    req,
    title: "Wildleaf Journal | Services",
    description: "Review Wildleaf Journal's editorial, writing, and consulting services.",
    path: "/services",
    body: `<header><p class="kicker">Services</p><h1>Editorial and writing services</h1><p class="meta">Writing, editing, and consulting support for science and nature-focused projects.</p></header>`,
  }));
});

router.get("/species", async (req, res, next) => {
  try {
    const species = await db.select().from(speciesTable).orderBy(speciesTable.commonName).limit(18);

    res.type("text/html").send(renderDocument({
      req,
      title: "Wildleaf Journal | Species",
      description: "Discover species profiles and nature writing from Wildleaf Journal.",
      path: "/species",
      body: `<header><p class="kicker">Species</p><h1>Species profiles</h1><p class="meta">A searchable archive of field-based profiles.</p></header><section class="card-grid">${species.map((item) => `<article class="card"><h3><a href="/species/${escapeHtml(item.slug)}">${escapeHtml(item.commonName)}</a></h3><p>${escapeHtml(truncateText(item.scientificName))}</p></article>`).join("")}</section>`,
    }));
  } catch (error) {
    next(error);
  }
});

router.get("/species/:slug", async (req, res, next) => {
  try {
    const [species] = await db.select().from(speciesTable).where(eq(speciesTable.slug, req.params.slug));
    if (!species) {
      res.status(404).type("text/html").send(renderDocument({
        req,
        title: "Wildleaf Journal | Species not found",
        description: DEFAULT_DESCRIPTION,
        path: req.path,
        body: `<header><p class="kicker">404</p><h1>Species not found</h1><p class="meta">The requested species profile is unavailable.</p></header>`,
      }));
      return;
    }

    const body = `<header><p class="kicker">Species</p><h1>${escapeHtml(species.commonName)}</h1><p class="meta">${escapeHtml(species.scientificName)}</p></header>`;
    res.type("text/html").send(renderDocument({
      req,
      title: `${species.commonName} | Wildleaf Journal`,
      description: truncateText(`${species.commonName} (${species.scientificName})`),
      path: req.path,
      body,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: species.commonName,
        author: { "@id": `${getSiteOrigin(req)}/#sunayana-yakkala` },
        publisher: { "@id": `${getSiteOrigin(req)}/#sunayana-yakkala` },
      },
    }));
  } catch (error) {
    next(error);
  }
});

export default router;

