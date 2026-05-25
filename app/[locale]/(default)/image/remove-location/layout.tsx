import { createPageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

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
}: {
  children: React.ReactNode;
}) {
  return children;
}
