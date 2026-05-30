export const toolIcons = {
  percentage_calculator: "RiPercentLine",
  unit_converter: "RiExchangeDollarLine",
  age_calculator: "RiCalendar2Line",
  bmi_calculator: "RiBarChart2Line",
  raised_bed_soil_calculator: "RiSeedlingLine",
  password_generator: "RiKey2Line",
  uuid_generator: "RiFingerprint2Line",
  qr_code_generator: "RiQrCodeLine",
  json_formatter: "RiBracesLine",
  xml_formatter: "RiCodeSSlashLine",
  sql_formatter: "RiDatabase2Line",
  icon_generator: "RiImage2Line",
  image_compressor: "RiImageEditLine",
  images_to_pdf: "RiFilePdf2Line",
  pdf_to_images: "RiFileImageLine",
  photo_location_remover: "RiMapPinLine",
  laundry_symbol_decoder: "RiTShirtAirLine",
} as const;

export const toolLinks = {
  bmi_calculator: "/calculator/bmi",
  raised_bed_soil_calculator: "/raised-bed-soil-calculator",
  password_generator: "/generator/password",
  uuid_generator: "/generator/uuid",
  icon_generator: "/generator/icon-gen",
  image_compressor: "/image/compressor",
  images_to_pdf: "/image/to-pdf",
  pdf_to_images: "/image/pdf-to-images",
  photo_location_remover: "/image/remove-location",
  laundry_symbol_decoder: "/laundry-symbol-decoder",
  json_formatter: "/formatter/json",
  xml_formatter: "/formatter/xml",
} as const;

export const toolCategories = [
  {
    key: "calculator",
    path: "/calculator",
    tools: ["raised_bed_soil_calculator", "bmi_calculator"],
  },
  {
    key: "generator",
    path: "/generator",
    tools: ["password_generator", "uuid_generator", "icon_generator"],
  },
  {
    key: "image",
    path: "/image",
    tools: [
      "image_compressor",
      "images_to_pdf",
      "pdf_to_images",
      "photo_location_remover",
    ],
  },
  {
    key: "life",
    path: "/life",
    tools: ["laundry_symbol_decoder"],
  },
  {
    key: "formatter",
    path: "/formatter",
    tools: ["json_formatter", "xml_formatter"],
  },
] as const;

export type ToolCategoryKey = (typeof toolCategories)[number]["key"];
export type ImplementedToolKey = keyof typeof toolLinks;

export const categoryLinks = Object.fromEntries(
  toolCategories.map((category) => [category.key, category.path])
) as Record<ToolCategoryKey, string>;

export const categoryRoutes: string[] = toolCategories.map(
  (category) => category.path
);
export const toolRoutes: string[] = Object.values(toolLinks);

export const publicSiteRoutes: string[] = [
  "/",
  ...categoryRoutes,
  ...toolRoutes,
  "/privacy-policy",
  "/terms-of-service",
];
