import ToolCategoryPage from "@/components/blocks/ToolCategoryPage";
import { createToolCategoryMetadata } from "@/lib/tool-category-seo";
import { getToolCategories } from "@/services/tools";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return createToolCategoryMetadata({
    locale,
    categoryKey: "calculator",
    path: "/calculator",
  });
}

export default async function CalculatorPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const categories = await getToolCategories(locale);
  const category = categories.find(
    (item) => item.key === "calculator"
  );

  if (!category) {
    notFound();
  }

  return (
    <ToolCategoryPage
      category={category}
      categories={categories}
      locale={locale}
    />
  );
}
