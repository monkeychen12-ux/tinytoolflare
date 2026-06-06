import ToolSeoShell from "@/components/blocks/ToolSeoShell";
import { createPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations(
    "tools.categories.generator.tools.classroom_seating_chart_generator"
  );

  return createPageMetadata({
    locale,
    path: "/generator/classroom-seating-chart",
    title: t("page_title"),
    description: t("page_description"),
    keywords: t("page_keywords"),
  });
}

export default function ClassroomSeatingChartLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <ToolSeoShell
      locale={locale}
      categoryKey="generator"
      toolKey="classroom_seating_chart_generator"
      path="/generator/classroom-seating-chart"
    >
      {children}
    </ToolSeoShell>
  );
}
