import ToolCategoryGrid from "@/components/blocks/ToolCategoryGrid";
import { ToolCategory } from "@/types/tools";

export default function ToolCategoryPage({
  category,
}: {
  category: ToolCategory;
}) {
  return (
    <section className="py-12">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
        </div>
        <ToolCategoryGrid categories={[category]} showCategoryTitle={false} />
      </div>
    </section>
  );
}
