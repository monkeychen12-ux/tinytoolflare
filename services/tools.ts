import { getTranslations } from "next-intl/server";
import { ToolCategory, ToolConfig } from "@/types/tools";

// 工具图标映射（Remix Icon 名称）
export const toolIcons = {
  // 计算器
  percentage_calculator: "RiPercentLine",
  unit_converter: "RiExchangeDollarLine",
  age_calculator: "RiCalendar2Line",
  bmi_calculator: "RiBarChart2Line",
  
  // 生成器
  password_generator: "RiKey2Line",
  uuid_generator: "RiFingerprint2Line",
  qr_code_generator: "RiQrCodeLine",
  
  // 格式化器
  json_formatter: "RiBracesLine",
  xml_formatter: "RiCodeSSlashLine",
  sql_formatter: "RiDatabase2Line",
};

// 工具链接映射
export const toolLinks = {
  // 计算器
  percentage_calculator: "/tools/calculator/percentage",
  unit_converter: "/tools/calculator/unit-converter",
  age_calculator: "/tools/calculator/age",
  bmi_calculator: "/tools/calculator/bmi",
  
  // 生成器
  password_generator: "/tools/generator/password",
  uuid_generator: "/tools/generator/uuid",
  qr_code_generator: "/tools/generator/qr-code",
  
  // 格式化器
  json_formatter: "/tools/formatter/json",
  xml_formatter: "/tools/formatter/xml",
  sql_formatter: "/tools/formatter/sql",
};

// 工具分类配置
export const toolCategories: ToolConfig[] = [
  {
    key: "calculator",
    tools: ["percentage_calculator", "unit_converter", "age_calculator", "bmi_calculator"],
  },
  {
    key: "generator", 
    tools: ["password_generator", "uuid_generator", "qr_code_generator"],
  },
  {
    key: "formatter",
    tools: ["json_formatter", "xml_formatter", "sql_formatter"],
  },
];

// 获取工具分类数据
export async function getToolCategories(locale: string): Promise<ToolCategory[]> {
  const t = await getTranslations({ locale });
  
  return toolCategories.map(category => {
    const categoryKey = `tools.categories.${category.key}`;
    
    return {
      name: t(`${categoryKey}.name`),
      tools: category.tools.map(toolKey => ({
        icon: toolIcons[toolKey as keyof typeof toolIcons],
        title: t(`${categoryKey}.tools.${toolKey}.title`),
        description: t(`${categoryKey}.tools.${toolKey}.description`),
        link: toolLinks[toolKey as keyof typeof toolLinks],
      })),
    };
  });
} 