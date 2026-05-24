import ToolCategoryPage from "@/components/blocks/ToolCategoryPage";
import { createPageMetadata } from "@/lib/seo";
import { getToolCategories } from "@/services/tools";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return createPageMetadata({
    locale,
    path: "/calculator",
    title: "Online Calculators | TinyToolFlare",
    description:
      "Free online calculators from TinyToolFlare, including BMI and practical everyday calculation tools.",
    keywords: "online calculator, BMI calculator, free calculator, TinyToolFlare",
  });
}

export default async function CalculatorPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const category = (await getToolCategories(locale)).find(
    (item) => item.key === "calculator"
  );

  if (!category) {
    notFound();
  }

  return <ToolCategoryPage category={category} />;
}
