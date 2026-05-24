import { createPageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations("tools.categories.formatter.tools.xml_formatter");

  return createPageMetadata({
    locale,
    path: "/formatter/xml",
    title: t("page_title"),
    description: t("page_description"),
    keywords: t("page_keywords"),
  });
}

export default function XmlLayout({ children }: { children: React.ReactNode }) {
  return children;
}
