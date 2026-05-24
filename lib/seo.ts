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
