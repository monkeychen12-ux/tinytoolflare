import Hero from "@/components/blocks/hero";
import { getLandingPage } from "@/services/page";
import { getToolCategories } from "@/services/tools";
import ToolCategoryGrid from "@/components/blocks/ToolCategoryGrid";
import {
  getCanonicalUrl,
  getLanguageAlternates,
  getOpenGraphLocale,
  indexRobots,
  siteName,
  siteUrl,
} from "@/lib/seo";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const canonicalUrl = getCanonicalUrl(locale);

  return {
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: getLanguageAlternates(),
    },
    robots: indexRobots,
    openGraph: {
      type: "website",
      siteName,
      locale: getOpenGraphLocale(locale),
      url: canonicalUrl,
    },
    twitter: {
      card: "summary",
    },
  };
}

export default async function LandingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const page = await getLandingPage(locale);
  const toolCategories = await getToolCategories(locale);
  const tools = toolCategories.flatMap((category) =>
    category.tools.map((tool) => ({
      "@type": "ListItem",
      name: tool.title,
      description: tool.description,
      url: `${siteUrl}${tool.link}`,
    }))
  );
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: siteName,
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
      },
      {
        "@type": "WebSite",
        name: siteName,
        url: siteUrl,
        inLanguage: locale === "zh" ? "zh-CN" : "en-US",
      },
      {
        "@type": "ItemList",
        name: "TinyToolFlare online tools",
        itemListElement: tools.map((tool, index) => ({
          position: index + 1,
          ...tool,
        })),
      },
    ],
  };
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Hero hero={page.hero || {}} />
      {/* 工具分类区块 */}
      <section className="py-16 bg-muted">
        <div className="container">
          <ToolCategoryGrid categories={toolCategories} />
        </div>
      </section>
      {/* 其它区块可后续逐步恢复 */}
      {/* <FAQ section={page.faq} /> */}
    </>
  );
}
