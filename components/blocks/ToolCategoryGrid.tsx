"use client";

import ToolCard from "./ToolCard";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { ToolCategory } from "@/types/tools";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

interface ToolCategoryGridProps {
  categories: ToolCategory[];
  showCategoryTitle?: boolean;
}

export default function ToolCategoryGrid({
  categories,
  showCategoryTitle = true,
}: ToolCategoryGridProps) {
  const t = useTranslations("tools");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredCategories = useMemo(() => {
    if (!normalizedQuery) {
      return categories;
    }

    return categories
      .map((category) => {
        const categoryMatches = category.name
          .toLowerCase()
          .includes(normalizedQuery);
        const tools = category.tools.filter((tool) => {
          return (
            categoryMatches ||
            tool.title.toLowerCase().includes(normalizedQuery) ||
            tool.description.toLowerCase().includes(normalizedQuery)
          );
        });

        return {
          ...category,
          tools,
        };
      })
      .filter((category) => category.tools.length > 0);
  }, [categories, normalizedQuery]);
  const hasResults = filteredCategories.length > 0;

  return (
    <div className="space-y-10">
      <div className="relative mx-auto max-w-2xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("search_placeholder")}
          className="h-12 rounded-lg pl-10 pr-10 text-base"
          aria-label={t("search_placeholder")}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={t("clear_search")}
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {!hasResults && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          {t("no_search_results")}
        </div>
      )}

      {filteredCategories.map((cat) => (
        <div key={cat.name} id={cat.key}>
          {showCategoryTitle && (
            <h2 className="text-2xl font-bold mb-4">{cat.name}</h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cat.tools.map((tool) => (
              <ToolCard key={tool.title} {...tool} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 
