import { Metadata } from "next";

export const siteUrl = "https://www.tinytoolflare.com";
export const siteName = "TinyToolFlare";

export const locales = ["en", "zh"] as const;
export type AppLocale = (typeof locales)[number];

export function getLocalizedPath(locale: string, path = "") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (locale === "en") {
    return normalizedPath === "/" ? "" : normalizedPath;
  }

  return normalizedPath === "/" ? `/${locale}` : `/${locale}${normalizedPath}`;
}

export function getCanonicalUrl(locale: string, path = "") {
  return `${siteUrl}${getLocalizedPath(locale, path)}`;
}

export function getLanguageAlternates(path = "") {
  return {
    en: getCanonicalUrl("en", path),
    zh: getCanonicalUrl("zh", path),
    "x-default": getCanonicalUrl("en", path),
  };
}

export function getOpenGraphLocale(locale: string) {
  return locale === "zh" ? "zh_CN" : "en_US";
}

function removeSiteNameSuffix(title: string) {
  return title.replace(new RegExp(`\\s*\\|\\s*${siteName}\\s*$`), "").trim();
}

export function createPageMetadata({
  locale,
  path,
  title,
  description,
  keywords,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
  keywords?: string;
}): Metadata {
  const canonical = getCanonicalUrl(locale, path);
  const pageTitle = removeSiteNameSuffix(title);

  return {
    metadataBase: new URL(siteUrl),
    title: pageTitle,
    description,
    keywords,
    alternates: {
      canonical,
      languages: getLanguageAlternates(path),
    },
    robots: indexRobots,
    openGraph: {
      type: "website",
      title: pageTitle,
      description,
      url: canonical,
      siteName,
      locale: getOpenGraphLocale(locale),
      images: [
        {
          url: "/logo.png",
          width: 512,
          height: 512,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: pageTitle,
      description,
      images: ["/logo.png"],
    },
  };
}

export const indexRobots: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};
