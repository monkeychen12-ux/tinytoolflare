import { getTranslations } from "next-intl/server";
import { ToolCategory, ToolConfig } from "@/types/tools";
import { getLocalizedPath } from "@/lib/seo";

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
  icon_generator: "RiImage2Line",

  // 图片
  image_compressor: "RiImageEditLine",
  images_to_pdf: "RiFilePdf2Line",
  pdf_to_images: "RiFileImageLine",
  photo_location_remover: "RiMapPinLine",
};

// 工具链接映射
export const toolLinks = {
  // 计算器
  // percentage_calculator: "/calculator/percentage",
  // unit_converter: "/calculator/unit-converter",
  // age_calculator: "/calculator/age",
  bmi_calculator: "/calculator/bmi",
  
  // 生成器
  password_generator: "/generator/password",
  uuid_generator: "/generator/uuid",
  icon_generator: "/generator/icon-gen",
  // qr_code_generator: "/generator/qr-code",

  // 图片
  image_compressor: "/image/compressor",
  images_to_pdf: "/image/to-pdf",
  pdf_to_images: "/image/pdf-to-images",
  photo_location_remover: "/image/remove-location",
  
  // 格式化器
  json_formatter: "/formatter/json",
  xml_formatter: "/formatter/xml",
  // sql_formatter: "/formatter/sql",
};

// 工具分类配置
export const toolCategories: ToolConfig[] = [
  {
    key: "calculator",
    tools: [ "bmi_calculator"],
  },
  {
    key: "generator", 
    tools: ["password_generator", "uuid_generator", "icon_generator"],
  },
  {
    key: "image",
    tools: [
      "image_compressor",
      "images_to_pdf",
      "pdf_to_images",
      "photo_location_remover",
    ],
  },
  {
    key: "formatter",
    tools: ["json_formatter", "xml_formatter"],
  },
];

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
