import ToolCategoryPage from "@/components/blocks/ToolCategoryPage";
import { createPageMetadata } from "@/lib/seo";
import { getToolCategories } from "@/services/tools";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return createPageMetadata({
    locale,
    path: "/generator",
    title: "Online Generators | TinyToolFlare",
    description:
      "Free online generators from TinyToolFlare, including password, UUID, and icon generation tools.",
    keywords:
      "online generator, password generator, UUID generator, icon generator, TinyToolFlare",
  });
}

export default async function GeneratorPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const category = (await getToolCategories(locale)).find(
    (item) => item.key === "generator"
  );

  if (!category) {
    notFound();
  }

  return <ToolCategoryPage category={category} />;
}
