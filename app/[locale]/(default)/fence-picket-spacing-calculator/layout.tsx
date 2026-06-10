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
    "tools.categories.calculator.tools.fence_picket_spacing_calculator"
  );

  return createPageMetadata({
    locale,
    path: "/fence-picket-spacing-calculator",
    title: t("page_title"),
    description: t("page_description"),
    keywords: t("page_keywords"),
  });
}

export default function FencePicketSpacingCalculatorLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <ToolSeoShell
      locale={locale}
      categoryKey="calculator"
      toolKey="fence_picket_spacing_calculator"
      path="/fence-picket-spacing-calculator"
    >
      {children}
    </ToolSeoShell>
  );
}
