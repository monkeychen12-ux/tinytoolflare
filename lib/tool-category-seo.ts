import { createPageMetadata } from "@/lib/seo";
import { getToolCategories } from "@/services/tools";
import type { Metadata } from "next";

export async function createToolCategoryMetadata({
  locale,
  categoryKey,
  path,
}: {
  locale: string;
  categoryKey: string;
  path: string;
}): Promise<Metadata> {
  const category = (await getToolCategories(locale)).find(
    (item) => item.key === categoryKey
  );
  const categoryName = category?.name ?? categoryKey;
  const toolNames =
    category?.tools.map((tool) => tool.title).join(locale === "zh" ? "、" : ", ") ??
    "";
  const lowerCategoryName = categoryName.toLowerCase();

  return createPageMetadata({
    locale,
    path,
    title:
      locale === "zh"
        ? `${categoryName} - 免费在线工具 | TinyToolFlare`
        : `Online ${categoryName} Tools | TinyToolFlare`,
    description:
      locale === "zh"
        ? `浏览 TinyToolFlare 的${categoryName}工具，包括 ${toolNames}。无需安装，免费在线使用。`
        : `Browse free TinyToolFlare ${lowerCategoryName} tools, including ${toolNames}. No installation required.`,
    keywords:
      locale === "zh"
        ? `${categoryName}, ${toolNames}, 免费在线工具, TinyToolFlare`
        : `${lowerCategoryName} tools, ${toolNames}, free online tools, TinyToolFlare`,
  });
}
