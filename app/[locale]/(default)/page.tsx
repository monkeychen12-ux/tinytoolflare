import Branding from "@/components/blocks/branding";
import CTA from "@/components/blocks/cta";
import FAQ from "@/components/blocks/faq";
import Feature from "@/components/blocks/feature";
import Feature1 from "@/components/blocks/feature1";
import Feature2 from "@/components/blocks/feature2";
import Feature3 from "@/components/blocks/feature3";
import Hero from "@/components/blocks/hero";
import Pricing from "@/components/blocks/pricing";
import Showcase from "@/components/blocks/showcase";
import Stats from "@/components/blocks/stats";
import Testimonial from "@/components/blocks/testimonial";
import { getLandingPage } from "@/services/page";
import { getToolCategories } from "@/services/tools";
import Header from "@/components/blocks/header";
import Footer from "@/components/blocks/footer";
import ToolCategoryGrid from "@/components/blocks/ToolCategoryGrid";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}`;

  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}`;
  }

  return {
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function LandingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const page = await getLandingPage(locale);
  const toolCategories = await getToolCategories(locale);
  
  return (
    <> 
      <Hero hero={page.hero || {}} />
      {/* 工具分类区块 */}
      <section className="py-16 bg-muted">
        <div className="container">
          <ToolCategoryGrid categories={toolCategories} />
        </div>
      </section>
      {/* 其它区块可后续逐步恢复 */}
      {/* <FAQ section={page.faq} /> */}
    </>
  );
}