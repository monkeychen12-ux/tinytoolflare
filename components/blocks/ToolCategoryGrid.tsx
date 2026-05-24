import ToolCard from "./ToolCard";
import { ToolCategory } from "@/types/tools";

interface ToolCategoryGridProps {
  categories: ToolCategory[];
  showCategoryTitle?: boolean;
}

export default function ToolCategoryGrid({
  categories,
  showCategoryTitle = true,
}: ToolCategoryGridProps) {
  return (
    <div className="space-y-10">
      {categories.map((cat) => (
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
