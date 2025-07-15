import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tools.categories.generator.tools.icon_generator");
  return {
    title: t("page_title"),
    description: t("page_description"),
    keywords: t("page_keywords"),
  };
}

export default function IconGenLayout({ children }: { children: React.ReactNode }) {
  return children;
} 