import { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations("tools.categories.calculator.tools.bmi_calculator");
  
  return createPageMetadata({
    locale,
    path: "/calculator/bmi",
    title: t("page_title"),
    description: t("page_description"),
    keywords: t("page_keywords"),
  });
}

export default function BMILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
