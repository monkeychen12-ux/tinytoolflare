import { createPageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations(
    "tools.categories.life.tools.wake_window_by_age_calculator"
  );

  return createPageMetadata({
    locale,
    path: "/wake-window-by-age-calculator",
    title: t("page_title"),
    description: t("page_description"),
    keywords: t("page_keywords"),
  });
}

export default function WakeWindowByAgeCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
