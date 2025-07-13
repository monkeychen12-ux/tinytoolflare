import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations("tools.categories.calculator.tools.bmi_calculator");
  
  return {
    title: t("page_title"),
    description: t("page_description"),
    keywords: t("page_keywords"),
    authors: [{ name: "TinyToolFlare" }],
    robots: "index, follow",
    openGraph: {
      type: "website",
      title: t("page_title"),
      description: t("page_description"),
      url: `https://tinytoolflare.com/${locale}/bmi`,
      siteName: "TinyToolFlare",
      locale: locale === 'en' ? 'en_US' : 'zh_CN',
    },
    twitter: {
      card: "summary_large_image",
      title: t("page_title"),
      description: t("page_description"),
    },
    alternates: {
      canonical: `https://tinytoolflare.com/${locale}/bmi`,
      languages: {
        'zh': 'https://tinytoolflare.com/zh/bmi',
        'en': 'https://tinytoolflare.com/en/bmi',
        'x-default': 'https://tinytoolflare.com/zh/bmi',
      },
    },
  };
}

export default function BMILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 