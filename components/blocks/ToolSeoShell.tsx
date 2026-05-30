import RelatedTools from "@/components/blocks/RelatedTools";
import {
  categoryLinks,
  type ImplementedToolKey,
  type ToolCategoryKey,
} from "@/lib/tool-registry";
import { getCanonicalUrl, siteName, siteUrl } from "@/lib/seo";
import { getMessages, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

interface ToolSeoShellProps {
  children: ReactNode;
  locale: string;
  categoryKey: ToolCategoryKey;
  toolKey: ImplementedToolKey;
  path: string;
  structuredData?: boolean;
}

function asList<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value && typeof value === "object") {
    return Object.values(value) as T[];
  }

  return [];
}

function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function getNestedValue(value: unknown, path: string[]) {
  return path.reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") {
      return undefined;
    }

    return (current as Record<string, unknown>)[key];
  }, value);
}

function getFaqItems({
  messages,
  categoryKey,
  toolKey,
}: {
  messages: unknown;
  categoryKey: ToolCategoryKey;
  toolKey: ImplementedToolKey;
}) {
  const items = getNestedValue(messages, [
    "tools",
    "categories",
    categoryKey,
    "tools",
    toolKey,
    "faq",
    "items",
  ]);

  return asList<FaqItem>(items).filter((item) => {
    return item.question && item.answer;
  });
}

export default async function ToolSeoShell({
  children,
  locale,
  categoryKey,
  toolKey,
  path,
  structuredData = true,
}: ToolSeoShellProps) {
  const [categoryT, toolT, messages] = await Promise.all([
    getTranslations({ locale, namespace: `tools.categories.${categoryKey}` }),
    getTranslations({
      locale,
      namespace: `tools.categories.${categoryKey}.tools.${toolKey}`,
    }),
    getMessages({ locale }),
  ]);
  const url = getCanonicalUrl(locale, path);
  const categoryUrl = getCanonicalUrl(locale, categoryLinks[categoryKey]);
  const name = toolT("title");
  const description = toolT("description");
  const faqItems = getFaqItems({ messages, categoryKey, toolKey });
  const graph: unknown[] = [
    {
      "@type": "WebApplication",
      name,
      description,
      url,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      isPartOf: {
        "@type": "WebSite",
        name: siteName,
        url: siteUrl,
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: siteName,
          item: getCanonicalUrl(locale),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: categoryT("name"),
          item: categoryUrl,
        },
        {
          "@type": "ListItem",
          position: 3,
          name,
          item: url,
        },
      ],
    },
  ];

  if (faqItems.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      )}
      {children}
      <RelatedTools categoryKey={categoryKey} currentPath={path} />
    </>
  );
}
