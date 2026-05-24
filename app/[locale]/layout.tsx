import "@/app/globals.css";

import { getMessages, getTranslations } from "next-intl/server";

import { AppContextProvider } from "@/contexts/app";
import { Metadata } from "next";
import { NextAuthSessionProvider } from "@/auth/session";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@/providers/theme";
import { cn } from "@/lib/utils";
import {
  getCanonicalUrl,
  getLanguageAlternates,
  getOpenGraphLocale,
  indexRobots,
  siteName,
  siteUrl,
} from "@/lib/seo";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations();
  const title = t("metadata.title") || siteName;
  const description = t("metadata.description") || "";
  const keywords = t("metadata.keywords") || "";
  const canonical = getCanonicalUrl(locale);

  return {
    metadataBase: new URL(siteUrl),
    applicationName: siteName,
    title: {
      template: `%s | ${siteName}`,
      default: title,
    },
    description,
    keywords,
    alternates: {
      canonical,
      languages: getLanguageAlternates(),
    },
    robots: indexRobots,
    openGraph: {
      type: "website",
      siteName,
      locale: getOpenGraphLocale(locale),
      url: canonical,
      title,
      description,
      images: [
        {
          url: "/logo.png",
          width: 512,
          height: 512,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["/logo.png"],
    },
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/logo.png", type: "image/png", sizes: "32x32" },
      ],
      apple: [{ url: "/logo.png", sizes: "180x180", type: "image/png" }],
    },
  };
}

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var theme = localStorage.getItem('theme');
    var isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // 立即设置主题类，避免闪烁
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // 设置背景色以防止闪烁
    document.documentElement.style.backgroundColor = isDark ? 'hsl(20 14.3% 4.1%)' : 'hsl(0 0% 100%)';
    document.body.style.backgroundColor = isDark ? 'hsl(20 14.3% 4.1%)' : 'hsl(0 0% 100%)';
  } catch (e) {}
})();
            `,
          }}
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased overflow-x-hidden"
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <NextAuthSessionProvider>
            <AppContextProvider>
              <ThemeProvider attribute="class" disableTransitionOnChange>
                {children}
              </ThemeProvider>
            </AppContextProvider>
          </NextAuthSessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
