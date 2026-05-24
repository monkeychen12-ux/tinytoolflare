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
    path: "/image",
    title: "Online Image Tools | TinyToolFlare",
    description:
      "Free browser-based image tools from TinyToolFlare, including image compression to a target file size.",
    keywords:
      "online image tools, image compressor, compress image, reduce photo size, TinyToolFlare",
  });
}

export default async function ImagePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const category = (await getToolCategories(locale)).find(
    (item) => item.key === "image"
  );

  if (!category) {
    notFound();
  }

  return <ToolCategoryPage category={category} />;
}
