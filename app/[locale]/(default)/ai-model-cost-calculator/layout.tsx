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
    "tools.categories.calculator.tools.ai_model_cost_calculator"
  );

  return createPageMetadata({
    locale,
    path: "/ai-model-cost-calculator",
    title: t("page_title"),
    description: t("page_description"),
    keywords: t("page_keywords"),
  });
}

export default function AiModelCostCalculatorLayout({
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
      toolKey="ai_model_cost_calculator"
      path="/ai-model-cost-calculator"
      structuredData={false}
    >
      {children}
    </ToolSeoShell>
  );
}
