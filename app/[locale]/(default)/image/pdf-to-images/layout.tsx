import { createPageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import ToolSeoShell from "@/components/blocks/ToolSeoShell";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations("tools.categories.image.tools.pdf_to_images");

  return createPageMetadata({
    locale,
    path: "/image/pdf-to-images",
    title: t("page_title"),
    description: t("page_description"),
    keywords: t("page_keywords"),
  });
}

export default function PdfToImagesLayout({
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
      toolKey="pdf_to_images"
      path="/image/pdf-to-images"
    >
      {children}
    </ToolSeoShell>
  );
}
