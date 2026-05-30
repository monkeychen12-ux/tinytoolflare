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
    "tools.categories.image.tools.photo_location_remover"
  );

  return createPageMetadata({
    locale,
    path: "/image/remove-location",
    title: t("page_title"),
    description: t("page_description"),
    keywords: t("page_keywords"),
  });
}

export default function PhotoLocationRemoverLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <ToolSeoShell
      locale={locale}
      categoryKey="image"
      toolKey="photo_location_remover"
      path="/image/remove-location"
    >
      {children}
    </ToolSeoShell>
  );
}
