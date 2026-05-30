import { getTranslations } from "next-intl/server";
import { ToolCategory } from "@/types/tools";
import { getLocalizedPath } from "@/lib/seo";
import {
  toolCategories,
  toolIcons,
  toolLinks,
} from "@/lib/tool-registry";

export { toolCategories, toolIcons, toolLinks };

// 获取工具分类数据
export async function getToolCategories(locale: string): Promise<ToolCategory[]> {
  const t = await getTranslations({ locale });
  
  return toolCategories.map(category => {
    const categoryKey = `tools.categories.${category.key}`;
    
    return {
      name: t(`${categoryKey}.name`),
      key: category.key,
      tools: category.tools.map(toolKey => ({
        icon: toolIcons[toolKey as keyof typeof toolIcons],
        title: t(`${categoryKey}.tools.${toolKey}.title`),
        description: t(`${categoryKey}.tools.${toolKey}.description`),
        link: getLocalizedPath(locale, toolLinks[toolKey as keyof typeof toolLinks]),
      })),
    };
  });
} 
