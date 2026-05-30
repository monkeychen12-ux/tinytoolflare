import type { MetadataRoute } from "next";
import {
  getCanonicalUrl,
  getLanguageAlternates,
  locales,
} from "@/lib/seo";
import {
  categoryRoutes,
  publicSiteRoutes,
  toolRoutes,
} from "@/lib/tool-registry";

const routes = Array.from(new Set(publicSiteRoutes));

function getPriority(path: string) {
  if (path === "/") {
    return 1;
  }

  if (categoryRoutes.includes(path)) {
    return 0.9;
  }

  if (toolRoutes.includes(path)) {
    return 0.8;
  }

  return 0.3;
}

function getChangeFrequency(
  path: string
): MetadataRoute.Sitemap[number]["changeFrequency"] {
  if (path === "/" || categoryRoutes.includes(path)) {
    return "weekly";
  }

  return toolRoutes.includes(path) ? "monthly" : "yearly";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.flatMap((path) =>
    locales.map((locale) => ({
      url: getCanonicalUrl(locale, path),
      lastModified,
      changeFrequency: getChangeFrequency(path),
      priority: getPriority(path),
      alternates: {
        languages: getLanguageAlternates(path),
      },
    }))
  );
}
