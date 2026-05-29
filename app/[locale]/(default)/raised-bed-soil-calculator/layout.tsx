import { createPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations(
    "tools.categories.calculator.tools.raised_bed_soil_calculator"
  );

  return createPageMetadata({
    locale,
    path: "/raised-bed-soil-calculator",
    title: t("page_title"),
    description: t("page_description"),
    keywords: t("page_keywords"),
  });
}

export default function RaisedBedSoilCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
