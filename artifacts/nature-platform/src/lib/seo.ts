export const SEO_SITE_NAME = "Wildleaf Journal";
export const SEO_OWNER_NAME = "Sunayana Yakkala";
export const SEO_OWNER_ALTERNATE_NAME = "Sunayana";
export const SEO_DEFAULT_DESCRIPTION =
  "Wildleaf Journal is a nature writing platform with essays, field notes, and science stories designed to be discoverable in search.";
export const SEO_KEYWORDS =
  "Sunayana, Sunayana Yakkala, Wildleaf Journal, nature writing, field notes, science stories, conservation writing";

type SeoMeta = {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string;
  type?: string;
};

function setOrCreateMeta(selector: string, attribute: "name" | "property", value: string) {
  const element = document.head.querySelector<HTMLMetaElement>(selector) ?? document.createElement("meta");
  element.setAttribute(attribute, value);
  return element;
}

export function applySeoMeta({ title, description, canonicalPath, image, type = "website" }: SeoMeta) {
  if (typeof document === "undefined") return;

  document.title = title;

  const descriptionTag = setOrCreateMeta('meta[name="description"]', "name", "description");
  descriptionTag.setAttribute("content", description);

  const robotsTag = setOrCreateMeta('meta[name="robots"]', "name", "robots");
  robotsTag.setAttribute("content", "index,follow");

  const authorTag = setOrCreateMeta('meta[name="author"]', "name", "author");
  authorTag.setAttribute("content", SEO_OWNER_NAME);

  const keywordsTag = setOrCreateMeta('meta[name="keywords"]', "name", "keywords");
  keywordsTag.setAttribute("content", SEO_KEYWORDS);

  const articleAuthorTag = setOrCreateMeta('meta[property="article:author"]', "property", "article:author");
  articleAuthorTag.setAttribute("content", SEO_OWNER_NAME);

  const ogTitleTag = setOrCreateMeta('meta[property="og:title"]', "property", "og:title");
  ogTitleTag.setAttribute("content", title);

  const ogDescriptionTag = setOrCreateMeta('meta[property="og:description"]', "property", "og:description");
  ogDescriptionTag.setAttribute("content", description);

  const ogTypeTag = setOrCreateMeta('meta[property="og:type"]', "property", "og:type");
  ogTypeTag.setAttribute("content", type);

  const ogSiteNameTag = setOrCreateMeta('meta[property="og:site_name"]', "property", "og:site_name");
  ogSiteNameTag.setAttribute("content", SEO_SITE_NAME);

  const twitterCardTag = setOrCreateMeta('meta[name="twitter:card"]', "name", "twitter:card");
  twitterCardTag.setAttribute("content", image ? "summary_large_image" : "summary");

  const twitterTitleTag = setOrCreateMeta('meta[name="twitter:title"]', "name", "twitter:title");
  twitterTitleTag.setAttribute("content", title);

  const twitterDescriptionTag = setOrCreateMeta('meta[name="twitter:description"]', "name", "twitter:description");
  twitterDescriptionTag.setAttribute("content", description);

  if (image) {
    const ogImageTag = setOrCreateMeta('meta[property="og:image"]', "property", "og:image");
    ogImageTag.setAttribute("content", image);

    const twitterImageTag = setOrCreateMeta('meta[name="twitter:image"]', "name", "twitter:image");
    twitterImageTag.setAttribute("content", image);
  }

  if (canonicalPath) {
    const canonicalUrl = `${window.location.origin}${canonicalPath}`;
    let canonicalTag = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement("link");
      canonicalTag.rel = "canonical";
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.href = canonicalUrl;
  }

  const graph = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${window.location.origin}/#sunayana-yakkala`,
      name: SEO_OWNER_NAME,
      alternateName: SEO_OWNER_ALTERNATE_NAME,
      url: `${window.location.origin}/about`,
      knowsAbout: ["nature writing", "field notes", "science stories", "conservation writing"],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${window.location.origin}/#website`,
      name: SEO_SITE_NAME,
      url: `${window.location.origin}/`,
      author: { "@id": `${window.location.origin}/#sunayana-yakkala` },
      publisher: { "@id": `${window.location.origin}/#sunayana-yakkala` },
      inLanguage: "en",
    },
    {
      "@context": "https://schema.org",
      "@type": type === "article" ? "Article" : "WebPage",
      name: title,
      description,
      url: canonicalPath ? `${window.location.origin}${canonicalPath}` : window.location.href,
      author: { "@id": `${window.location.origin}/#sunayana-yakkala` },
      publisher: { "@id": `${window.location.origin}/#sunayana-yakkala` },
      isPartOf: { "@id": `${window.location.origin}/#website` },
      ...(image ? { image } : {}),
    },
  ];

  let jsonLdTag = document.head.querySelector<HTMLScriptElement>('script[data-seo-json-ld="true"]');
  if (!jsonLdTag) {
    jsonLdTag = document.createElement("script");
    jsonLdTag.type = "application/ld+json";
    jsonLdTag.dataset.seoJsonLd = "true";
    document.head.appendChild(jsonLdTag);
  }
  jsonLdTag.textContent = JSON.stringify(graph);
}
