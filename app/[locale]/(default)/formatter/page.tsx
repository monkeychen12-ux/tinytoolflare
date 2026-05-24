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
    path: "/formatter",
    title: "Online Formatters | TinyToolFlare",
    description:
      "Free online formatter tools from TinyToolFlare for JSON, XML, and developer data processing.",
    keywords:
      "online formatter, JSON formatter, XML formatter, developer tools, TinyToolFlare",
  });
}

export default async function FormatterPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const category = (await getToolCategories(locale)).find(
    (item) => item.key === "formatter"
  );

  if (!category) {
    notFound();
  }

  return <ToolCategoryPage category={category} />;
}
