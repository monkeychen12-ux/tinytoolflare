import { createPageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import ToolSeoShell from "@/components/blocks/ToolSeoShell";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations("tools.categories.generator.tools.uuid_generator");
  return createPageMetadata({
    locale,
    path: "/generator/uuid",
    title: t("page_title"),
    description: t("page_description"),
    keywords: t("page_keywords"),
  });
}

export default function UUIDLayout({
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
      toolKey="uuid_generator"
      path="/generator/uuid"
    >
      {children}
    </ToolSeoShell>
  );
} 
