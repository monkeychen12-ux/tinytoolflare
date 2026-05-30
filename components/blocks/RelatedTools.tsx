"use client";

import Icon from "@/components/icon";
import { cn } from "@/lib/utils";
import {
  categoryLinks,
  toolCategories,
  toolIcons,
  toolLinks,
  type ImplementedToolKey,
  type ToolCategoryKey,
} from "@/lib/tool-registry";
import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

function getLocalizedPath(locale: string, path = "") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (locale === "en") {
    return normalizedPath === "/" ? "" : normalizedPath;
  }

  return normalizedPath === "/" ? `/${locale}` : `/${locale}${normalizedPath}`;
}

function isImplementedToolKey(key: string): key is ImplementedToolKey {
  return key in toolLinks;
}

function getToolCategoryKey(toolKey: ImplementedToolKey) {
  return toolCategories.find((category) =>
    (category.tools as readonly string[]).includes(toolKey)
  )?.key;
}

interface RelatedToolsProps {
  categoryKey: ToolCategoryKey;
  currentPath: string;
  className?: string;
}

export default function RelatedTools({
  categoryKey,
  currentPath,
  className,
}: RelatedToolsProps) {
  const locale = useLocale();
  const t = useTranslations("tools");
  const currentCategory = toolCategories.find(
    (category) => category.key === categoryKey
  );

  if (!currentCategory) {
    return null;
  }

  const categoryName = t(`categories.${categoryKey}.name`);
  const relatedKeys = currentCategory.tools
    .filter(isImplementedToolKey)
    .filter((toolKey) => toolLinks[toolKey] !== currentPath);
  const fallbackKeys = toolCategories
    .flatMap((category) => category.tools)
    .filter(isImplementedToolKey)
    .filter((toolKey) => toolLinks[toolKey] !== currentPath)
    .filter((toolKey) => !relatedKeys.includes(toolKey))
    .slice(0, 3);
  const tools = (relatedKeys.length > 0 ? relatedKeys : fallbackKeys).slice(
    0,
    4
  );
  const title =
    relatedKeys.length > 0
      ? t("related_tools.title", { category: categoryName })
      : t("related_tools.fallback_title");

  if (tools.length === 0) {
    return null;
  }

  return (
    <section
      className={cn("mx-auto max-w-7xl px-4 pb-12", className)}
      aria-labelledby="related-tools-title"
    >
      <div className="border-t pt-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">
              {t("related_tools.eyebrow")}
            </p>
            <h2
              id="related-tools-title"
              className="mt-1 text-2xl font-bold tracking-tight"
            >
              {title}
            </h2>
          </div>
          <Link
            href={getLocalizedPath(locale, categoryLinks[categoryKey])}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t("related_tools.browse_category", { category: categoryName })}
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((toolKey) => (
            (() => {
              const toolCategoryKey = getToolCategoryKey(toolKey);

              if (!toolCategoryKey) {
                return null;
              }

              return (
                <Link
                  key={toolKey}
                  href={getLocalizedPath(locale, toolLinks[toolKey])}
                  className="group block h-full rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-muted/50"
                >
                  <div className="mb-3 flex items-center gap-2 text-primary">
                    <Icon
                      name={toolIcons[toolKey]}
                      className="size-5 shrink-0"
                    />
                    <span className="text-sm font-semibold text-foreground">
                      {t(
                        `categories.${toolCategoryKey}.tools.${toolKey}.title`
                      )}
                    </span>
                  </div>
                  <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {t(
                      `categories.${toolCategoryKey}.tools.${toolKey}.description`
                    )}
                  </p>
                </Link>
              );
            })()
          ))}
        </div>

        <nav
          aria-label={t("related_tools.other_categories")}
          className="mt-5 flex flex-wrap gap-2"
        >
          {toolCategories
            .filter((category) => category.key !== categoryKey)
            .map((category) => (
              <Link
                key={category.key}
                href={getLocalizedPath(locale, category.path)}
                className="rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {t(`categories.${category.key}.name`)}
              </Link>
            ))}
        </nav>
      </div>
    </section>
  );
}
