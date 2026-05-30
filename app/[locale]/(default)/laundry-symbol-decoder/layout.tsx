import { createPageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import ToolSeoShell from "@/components/blocks/ToolSeoShell";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations(
    "tools.categories.life.tools.laundry_symbol_decoder"
  );

  return createPageMetadata({
    locale,
    path: "/laundry-symbol-decoder",
    title: t("page_title"),
    description: t("page_description"),
    keywords: t("page_keywords"),
  });
}

export default function LaundrySymbolDecoderLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <ToolSeoShell
      locale={locale}
      categoryKey="life"
      toolKey="laundry_symbol_decoder"
      path="/laundry-symbol-decoder"
      structuredData={false}
    >
      {children}
    </ToolSeoShell>
  );
}
