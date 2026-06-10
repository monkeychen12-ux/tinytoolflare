export const toolIcons = {
  percentage_calculator: "RiPercentLine",
  unit_converter: "RiExchangeDollarLine",
  age_calculator: "RiCalendar2Line",
  bmi_calculator: "RiBarChart2Line",
  raised_bed_soil_calculator: "RiSeedlingLine",
  unit_price_comparison_calculator: "RiScales3Line",
  fence_picket_spacing_calculator: "RiRuler2Line",
  ai_model_cost_calculator: "RiMoneyDollarCircleLine",
  password_generator: "RiKey2Line",
  uuid_generator: "RiFingerprint2Line",
  qr_code_generator: "RiQrCodeLine",
  classroom_seating_chart_generator: "RiLayoutGridLine",
  text_card_generator: "RiTextSnippet",
  json_formatter: "RiBracesLine",
  xml_formatter: "RiCodeSSlashLine",
  sql_formatter: "RiDatabase2Line",
  icon_generator: "RiImage2Line",
  image_compressor: "RiImageEditLine",
  images_to_pdf: "RiFilePdf2Line",
  pdf_to_images: "RiFileImageLine",
  photo_location_remover: "RiMapPinLine",
  photo_from_emoji: "RiEmotionHappyLine",
  laundry_symbol_decoder: "RiTShirtAirLine",
  wake_window_by_age_calculator: "RiMoonClearLine",
} as const;

export const toolLinks = {
  bmi_calculator: "/calculator/bmi",
  raised_bed_soil_calculator: "/raised-bed-soil-calculator",
  unit_price_comparison_calculator: "/unit-price-comparison-calculator",
  fence_picket_spacing_calculator: "/fence-picket-spacing-calculator",
  ai_model_cost_calculator: "/ai-model-cost-calculator",
  password_generator: "/generator/password",
  uuid_generator: "/generator/uuid",
  classroom_seating_chart_generator: "/generator/classroom-seating-chart",
  icon_generator: "/generator/icon-gen",
  text_card_generator: "/generator/text-card",
  image_compressor: "/image/compressor",
  images_to_pdf: "/image/to-pdf",
  pdf_to_images: "/image/pdf-to-images",
  photo_location_remover: "/image/remove-location",
  photo_from_emoji: "/image/photo-from-emoji",
  laundry_symbol_decoder: "/laundry-symbol-decoder",
  wake_window_by_age_calculator: "/wake-window-by-age-calculator",
  json_formatter: "/formatter/json",
  xml_formatter: "/formatter/xml",
} as const;

export const toolCategories = [
  {
    key: "calculator",
    path: "/calculator",
    tools: [
      "unit_price_comparison_calculator",
      "raised_bed_soil_calculator",
      "fence_picket_spacing_calculator",
      "ai_model_cost_calculator",
      "bmi_calculator",
    ],
  },
  {
    key: "generator",
    path: "/generator",
    tools: [
      "password_generator",
      "uuid_generator",
      "classroom_seating_chart_generator",
      "icon_generator",
      "text_card_generator",
    ],
  },
  {
    key: "image",
    path: "/image",
    tools: [
      "image_compressor",
      "images_to_pdf",
      "pdf_to_images",
      "photo_location_remover",
      "photo_from_emoji",
    ],
  },
  {
    key: "life",
    path: "/life",
    tools: ["wake_window_by_age_calculator", "laundry_symbol_decoder"],
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
