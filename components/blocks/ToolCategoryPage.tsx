import ToolCategoryGrid from "@/components/blocks/ToolCategoryGrid";
import { getCanonicalUrl, getLocalizedPath, siteName, siteUrl } from "@/lib/seo";
import { categoryLinks, type ToolCategoryKey } from "@/lib/tool-registry";
import { ToolCategory } from "@/types/tools";
import Link from "next/link";

function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function ToolCategoryPage({
  category,
  categories,
  locale,
}: {
  category: ToolCategory;
  categories: ToolCategory[];
  locale: string;
}) {
  const toolNames = category.tools.map((tool) => tool.title).join(
    locale === "zh" ? "、" : ", "
  );
  const intro =
    locale === "zh"
      ? `浏览 TinyToolFlare 的${category.name}工具，包括 ${toolNames}。无需安装，直接在线使用。`
      : `Browse TinyToolFlare ${category.name.toLowerCase()} tools, including ${toolNames}. No installation required.`;
  const otherCategories = categories.filter(
    (item) => item.key !== category.key
  );
  const categoryPath = categoryLinks[category.key as ToolCategoryKey];
  const categoryUrl = getCanonicalUrl(locale, categoryPath);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: category.name,
        description: intro,
        url: categoryUrl,
        isPartOf: {
          "@type": "WebSite",
          name: siteName,
          url: siteUrl,
        },
      },
      {
        "@type": "ItemList",
        name:
          locale === "zh"
            ? `${category.name}工具`
            : `${category.name} tools`,
        itemListElement: category.tools.map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: tool.title,
          description: tool.description,
          url: `${siteUrl}${tool.link}`,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <section className="py-12">
        <div className="container">
          <div className="mb-6 max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight">
              {category.name}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {intro}
            </p>
          </div>

          {otherCategories.length > 0 && (
            <nav
              aria-label={
                locale === "zh" ? "其他工具分类" : "Other tool categories"
              }
              className="mb-8 flex flex-wrap gap-2"
            >
              {otherCategories.map((item) => (
                <Link
                  key={item.key}
                  href={getLocalizedPath(
                    locale,
                    categoryLinks[item.key as ToolCategoryKey]
                  )}
                  className="rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}

          <ToolCategoryGrid categories={[category]} showCategoryTitle={false} />
        </div>
      </section>
    </>
  );
}
