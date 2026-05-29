"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Calculator,
  CircleAlert,
  DollarSign,
  Layers,
  Leaf,
  Package,
  Ruler,
  Sprout,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

const CU_FT_TO_LITERS = 28.3168;
const CU_YD_TO_CU_FT = 27;
const FT_TO_M = 0.3048;
const IN_TO_CM = 2.54;

type UnitMode = "imperial" | "metric";
type CustomBagUnit = "cuft" | "liters";

interface TextBlock {
  title: string;
  description: string;
}

interface DepthGuide {
  depth: string;
  use: string;
  note: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface BagOption {
  value: string;
  volumeCuFt: number | null;
  label: string;
}

const presetSizes = [
  { label: "2 ft x 4 ft", lengthFt: 2, widthFt: 4 },
  { label: "3 ft x 6 ft", lengthFt: 3, widthFt: 6 },
  { label: "4 ft x 4 ft", lengthFt: 4, widthFt: 4 },
  { label: "4 ft x 8 ft", lengthFt: 4, widthFt: 8 },
  { label: "4 ft x 12 ft", lengthFt: 4, widthFt: 12 },
];

const commonAmounts = [
  { size: "2 ft x 4 ft", cuFt: 8 },
  { size: "3 ft x 6 ft", cuFt: 18 },
  { size: "4 ft x 4 ft", cuFt: 16 },
  { size: "4 ft x 8 ft", cuFt: 32 },
  { size: "4 ft x 12 ft", cuFt: 48 },
];

function asList<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value && typeof value === "object") {
    return Object.values(value) as T[];
  }

  return [];
}

function parseNumber(value: string) {
  if (value.trim() === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatNumber(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}

function formatInputNumber(value: number, maximumFractionDigits = 2) {
  return Number(value.toFixed(maximumFractionDigits)).toString();
}

function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function getBagOptions(t: ReturnType<typeof useTranslations>): BagOption[] {
  return [
    { value: "0.75-cu-ft", volumeCuFt: 0.75, label: "0.75 cu ft" },
    { value: "1-cu-ft", volumeCuFt: 1, label: "1 cu ft" },
    { value: "1.5-cu-ft", volumeCuFt: 1.5, label: "1.5 cu ft" },
    { value: "2-cu-ft", volumeCuFt: 2, label: "2 cu ft" },
    {
      value: "40-l",
      volumeCuFt: 40 / CU_FT_TO_LITERS,
      label: "40 L",
    },
    { value: "custom", volumeCuFt: null, label: t("custom_bag") },
  ];
}

export default function RaisedBedSoilCalculatorPage() {
  const t = useTranslations(
    "tools.categories.calculator.tools.raised_bed_soil_calculator"
  );
  const useCases = asList<TextBlock>(t.raw("use_cases.items"));
  const depthGuides = asList<DepthGuide>(t.raw("depth_guide.items"));
  const faqs = asList<FaqItem>(t.raw("faq.items"));
  const bagOptions = useMemo(() => getBagOptions(t), [t]);

  const [unitMode, setUnitMode] = useState<UnitMode>("imperial");
  const [length, setLength] = useState("4");
  const [width, setWidth] = useState("8");
  const [depth, setDepth] = useState("12");
  const [bedCount, setBedCount] = useState("1");
  const [bagOption, setBagOption] = useState("1.5-cu-ft");
  const [customBagSize, setCustomBagSize] = useState("1.5");
  const [customBagUnit, setCustomBagUnit] = useState<CustomBagUnit>("cuft");
  const [pricePerBag, setPricePerBag] = useState("");
  const [fillerEnabled, setFillerEnabled] = useState(false);
  const [fillerHeight, setFillerHeight] = useState("0");
  const [topsoilRatio, setTopsoilRatio] = useState("60");
  const [compostRatio, setCompostRatio] = useState("30");
  const [pottingRatio, setPottingRatio] = useState("10");

  const dimensionUnit = unitMode === "imperial" ? "ft" : "m";
  const depthUnit = unitMode === "imperial" ? "in" : "cm";
  const selectedBag = bagOptions.find((option) => option.value === bagOption);

  const calculation = useMemo(() => {
    const lengthValue = parseNumber(length);
    const widthValue = parseNumber(width);
    const depthValue = parseNumber(depth);
    const bedCountValue = parseNumber(bedCount);
    const fillerValue = fillerEnabled ? parseNumber(fillerHeight) ?? 0 : 0;
    const customBagValue = parseNumber(customBagSize);
    const priceValue = parseNumber(pricePerBag);
    const topsoilValue = parseNumber(topsoilRatio) ?? 0;
    const compostValue = parseNumber(compostRatio) ?? 0;
    const pottingValue = parseNumber(pottingRatio) ?? 0;
    const errors: string[] = [];
    const notices: string[] = [];

    if (!lengthValue || lengthValue <= 0) {
      errors.push(t("validation.length"));
    }

    if (!widthValue || widthValue <= 0) {
      errors.push(t("validation.width"));
    }

    if (!depthValue || depthValue <= 0) {
      errors.push(t("validation.depth"));
    }

    if (!bedCountValue || bedCountValue < 1) {
      errors.push(t("validation.beds"));
    }

    if (fillerEnabled && fillerValue < 0) {
      errors.push(t("validation.filler"));
    }

    if (pricePerBag.trim() !== "" && (priceValue === null || priceValue < 0)) {
      errors.push(t("validation.price"));
    }

    const bagVolumeCuFt =
      selectedBag?.volumeCuFt ??
      (customBagUnit === "cuft"
        ? customBagValue ?? 0
        : (customBagValue ?? 0) / CU_FT_TO_LITERS);

    if (!bagVolumeCuFt || bagVolumeCuFt <= 0) {
      errors.push(t("validation.bag"));
    }

    if (topsoilValue < 0 || compostValue < 0 || pottingValue < 0) {
      errors.push(t("validation.mix"));
    }

    const lengthFt =
      unitMode === "imperial" ? lengthValue ?? 0 : (lengthValue ?? 0) / FT_TO_M;
    const widthFt =
      unitMode === "imperial" ? widthValue ?? 0 : (widthValue ?? 0) / FT_TO_M;
    const totalDepthFt =
      unitMode === "imperial"
        ? (depthValue ?? 0) / 12
        : (depthValue ?? 0) / 30.48;
    const fillerDepthFt =
      unitMode === "imperial" ? fillerValue / 12 : fillerValue / 30.48;
    const soilDepthFt = Math.max(0, totalDepthFt - fillerDepthFt);

    if (fillerEnabled && soilDepthFt === 0 && (depthValue ?? 0) > 0) {
      notices.push(t("validation.zero_depth"));
    }

    const totalCuFt =
      errors.length === 0
        ? lengthFt * widthFt * soilDepthFt * (bedCountValue ?? 0)
        : 0;

    if (totalCuFt > 100000) {
      notices.push(t("validation.large"));
    }

    const bagsNeeded =
      errors.length === 0 && bagVolumeCuFt > 0
        ? Math.ceil(totalCuFt / bagVolumeCuFt)
        : 0;
    const cost =
      pricePerBag.trim() !== "" && priceValue !== null && priceValue >= 0
        ? bagsNeeded * priceValue
        : null;
    const mixTotal = topsoilValue + compostValue + pottingValue;
    const mixItems =
      mixTotal > 0
        ? [
            {
              key: "topsoil",
              label: t("mix.topsoil"),
              ratio: topsoilValue,
              cuFt: totalCuFt * (topsoilValue / mixTotal),
            },
            {
              key: "compost",
              label: t("mix.compost"),
              ratio: compostValue,
              cuFt: totalCuFt * (compostValue / mixTotal),
            },
            {
              key: "potting",
              label: t("mix.potting_mix"),
              ratio: pottingValue,
              cuFt: totalCuFt * (pottingValue / mixTotal),
            },
          ].filter((item) => item.ratio > 0)
        : [];

    return {
      bagsNeeded,
      bagVolumeCuFt,
      cost,
      cuFt: totalCuFt,
      cuYd: totalCuFt / CU_YD_TO_CU_FT,
      errors,
      liters: totalCuFt * CU_FT_TO_LITERS,
      mixItems,
      notices,
      soilDepthDisplay:
        unitMode === "imperial"
          ? soilDepthFt * 12
          : soilDepthFt * 30.48,
    };
  }, [
    bagOption,
    bedCount,
    compostRatio,
    customBagSize,
    customBagUnit,
    depth,
    fillerEnabled,
    fillerHeight,
    length,
    pottingRatio,
    pricePerBag,
    selectedBag?.volumeCuFt,
    t,
    topsoilRatio,
    unitMode,
    width,
  ]);

  const summary = t("summary", {
    beds:
      Number(bedCount) === 1
        ? t("one_bed")
        : t("many_beds", { count: bedCount || "0" }),
    length: `${length || "0"} ${dimensionUnit}`,
    width: `${width || "0"} ${dimensionUnit}`,
    depth: `${formatNumber(calculation.soilDepthDisplay, 1)} ${depthUnit}`,
    cuFt: formatNumber(calculation.cuFt, 1),
    bags: calculation.bagsNeeded,
    bagSize:
      bagOption === "custom"
        ? `${customBagSize || "0"} ${
            customBagUnit === "cuft" ? "cu ft" : "L"
          }`
        : selectedBag?.label ?? "",
  });

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: t("title"),
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      url: "https://www.tinytoolflare.com/raised-bed-soil-calculator",
      description: t("page_description"),
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "raised bed soil calculator",
        "garden soil calculator",
        "soil bag calculator",
        "raised bed soil cost estimate",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];

  function handleUnitModeChange(nextMode: UnitMode) {
    if (nextMode === unitMode) {
      return;
    }

    const lengthValue = parseNumber(length) ?? 0;
    const widthValue = parseNumber(width) ?? 0;
    const depthValue = parseNumber(depth) ?? 0;
    const fillerValue = parseNumber(fillerHeight) ?? 0;

    if (nextMode === "metric") {
      setLength(formatInputNumber(lengthValue * FT_TO_M, 2));
      setWidth(formatInputNumber(widthValue * FT_TO_M, 2));
      setDepth(formatInputNumber(depthValue * IN_TO_CM, 1));
      setFillerHeight(formatInputNumber(fillerValue * IN_TO_CM, 1));
    } else {
      setLength(formatInputNumber(lengthValue / FT_TO_M, 2));
      setWidth(formatInputNumber(widthValue / FT_TO_M, 2));
      setDepth(formatInputNumber(depthValue / IN_TO_CM, 1));
      setFillerHeight(formatInputNumber(fillerValue / IN_TO_CM, 1));
    }

    setUnitMode(nextMode);
  }

  function applyPreset(lengthFt: number, widthFt: number) {
    if (unitMode === "imperial") {
      setLength(lengthFt.toString());
      setWidth(widthFt.toString());
      return;
    }

    setLength(formatInputNumber(lengthFt * FT_TO_M, 2));
    setWidth(formatInputNumber(widthFt * FT_TO_M, 2));
  }

  return (
    <div className="md:max-w-7xl mx-auto py-8 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <div className="mb-6 max-w-3xl">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,520px)_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="size-5" />
              {t("tool_title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="mb-2 text-sm font-medium">{t("unit_system")}</div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={unitMode === "imperial" ? "default" : "outline"}
                  onClick={() => handleUnitModeChange("imperial")}
                >
                  {t("imperial")}
                </Button>
                <Button
                  type="button"
                  variant={unitMode === "metric" ? "default" : "outline"}
                  onClick={() => handleUnitModeChange("metric")}
                >
                  {t("metric")}
                </Button>
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium">{t("common_sizes")}</div>
              <div className="flex flex-wrap gap-2">
                {presetSizes.map((size) => (
                  <Button
                    key={size.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(size.lengthFt, size.widthFt)}
                  >
                    {size.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  {t("length_label", { unit: dimensionUnit })}
                </span>
                <Input
                  type="number"
                  min="0"
                  value={length}
                  onChange={(event) => setLength(event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  {t("width_label", { unit: dimensionUnit })}
                </span>
                <Input
                  type="number"
                  min="0"
                  value={width}
                  onChange={(event) => setWidth(event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  {t("depth_label", { unit: depthUnit })}
                </span>
                <Input
                  type="number"
                  min="0"
                  value={depth}
                  onChange={(event) => setDepth(event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">{t("beds_label")}</span>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={bedCount}
                  onChange={(event) => setBedCount(event.target.value)}
                />
              </label>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">{t("filler_title")}</div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {t("filler_description")}
                  </p>
                </div>
                <Switch
                  checked={fillerEnabled}
                  onCheckedChange={setFillerEnabled}
                  aria-label={t("filler_title")}
                />
              </div>
              {fillerEnabled && (
                <label className="mt-4 block space-y-2">
                  <span className="text-sm font-medium">
                    {t("filler_height", { unit: depthUnit })}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    value={fillerHeight}
                    onChange={(event) => setFillerHeight(event.target.value)}
                  />
                </label>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">{t("bag_size")}</span>
                <Select value={bagOption} onValueChange={setBagOption}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bagOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">{t("price_label")}</span>
                <Input
                  type="number"
                  min="0"
                  data-testid="price-per-bag-input"
                  placeholder={t("price_placeholder")}
                  value={pricePerBag}
                  onChange={(event) => setPricePerBag(event.target.value)}
                />
              </label>
            </div>

            {bagOption === "custom" && (
              <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    {t("custom_bag_size")}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    value={customBagSize}
                    onChange={(event) => setCustomBagSize(event.target.value)}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">
                    {t("custom_bag_unit")}
                  </span>
                  <Select
                    value={customBagUnit}
                    onValueChange={(value) =>
                      setCustomBagUnit(value as CustomBagUnit)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cuft">cu ft</SelectItem>
                      <SelectItem value="liters">L</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              </div>
            )}

            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center gap-2 font-medium">
                <Layers className="size-4" />
                {t("mix.title")}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-xs text-muted-foreground">
                    {t("mix.topsoil")}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    value={topsoilRatio}
                    onChange={(event) => setTopsoilRatio(event.target.value)}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs text-muted-foreground">
                    {t("mix.compost")}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    value={compostRatio}
                    onChange={(event) => setCompostRatio(event.target.value)}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs text-muted-foreground">
                    {t("mix.potting_mix")}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    value={pottingRatio}
                    onChange={(event) => setPottingRatio(event.target.value)}
                  />
                </label>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {t("mix.description")}
              </p>
            </div>

            <Alert>
              <Sprout className="size-4" />
              <AlertTitle>{t("safety_title")}</AlertTitle>
              <AlertDescription>{t("safety_text")}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-primary/25">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="size-5" />
                {t("results_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {(calculation.errors.length > 0 ||
                calculation.notices.length > 0) && (
                <Alert
                  variant={
                    calculation.errors.length > 0 ? "destructive" : "default"
                  }
                >
                  <CircleAlert className="size-4" />
                  <AlertTitle>
                    {calculation.errors.length > 0
                      ? t("check_inputs")
                      : t("note")}
                  </AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc space-y-1 pl-4">
                      {[...calculation.errors, ...calculation.notices].map(
                        (message) => (
                          <li key={message}>{message}</li>
                        )
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-primary/5 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="size-4" />
                    {t("bags_needed")}
                  </div>
                  <div
                    className="mt-2 text-4xl font-bold"
                    data-testid="bags-needed"
                  >
                    {calculation.bagsNeeded}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {t("bags_detail", {
                      size:
                        bagOption === "custom"
                          ? `${customBagSize || "0"} ${
                              customBagUnit === "cuft" ? "cu ft" : "L"
                            }`
                          : selectedBag?.label ?? "",
                    })}
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Ruler className="size-4" />
                    {t("total_volume")}
                  </div>
                  <div
                    className="mt-2 text-4xl font-bold"
                    data-testid="volume-cu-ft"
                  >
                    {formatNumber(calculation.cuFt, 1)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {t("cubic_feet")}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <div className="text-xs text-muted-foreground">
                    {t("cubic_yards")}
                  </div>
                  <div
                    className="mt-1 text-xl font-semibold"
                    data-testid="volume-cu-yd"
                  >
                    {formatNumber(calculation.cuYd, 2)}
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-xs text-muted-foreground">
                    {t("liters")}
                  </div>
                  <div
                    className="mt-1 text-xl font-semibold"
                    data-testid="volume-liters"
                  >
                    {formatNumber(calculation.liters, 0)}
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign className="size-3" />
                    {t("estimated_cost")}
                  </div>
                  <div
                    className="mt-1 text-xl font-semibold"
                    data-testid="estimated-cost"
                  >
                    {calculation.cost === null
                      ? "-"
                      : formatNumber(calculation.cost, 2)}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">
                {summary}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="size-5" />
                {t("mix.result_title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {calculation.mixItems.map((item) => (
                  <div key={item.key} className="rounded-lg border p-4">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="mt-2 text-2xl font-semibold">
                      {formatNumber(item.cuFt, 1)}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        cu ft
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatNumber(item.cuFt * CU_FT_TO_LITERS, 0)} L
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="mt-14">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold">{t("use_cases.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("use_cases.description")}
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {useCases.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold">{t("how_to.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("how_to.description")}
          </p>
        </div>
        <div className="mt-6 rounded-lg border p-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{t("how_to.formula")}</Badge>
            <Badge variant="outline">1 cu yd = 27 cu ft</Badge>
            <Badge variant="outline">1 cu ft = 28.3168 L</Badge>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {t("how_to.detail")}
          </p>
        </div>
      </section>

      <section className="mt-14">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold">{t("common_amounts.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("common_amounts.description")}
          </p>
        </div>
        <div className="mt-6 overflow-hidden rounded-lg border">
          <div className="grid min-w-[720px] grid-cols-5 bg-muted px-4 py-3 text-sm font-medium">
            <div>{t("common_amounts.size")}</div>
            <div>{t("common_amounts.depth")}</div>
            <div>{t("common_amounts.cu_ft")}</div>
            <div>{t("common_amounts.liters")}</div>
            <div>{t("common_amounts.bags")}</div>
          </div>
          <div className="overflow-x-auto">
            {commonAmounts.map((item) => (
              <div
                key={item.size}
                className="grid min-w-[720px] grid-cols-5 border-t px-4 py-3 text-sm"
              >
                <div className="font-medium">{item.size}</div>
                <div className="text-muted-foreground">12 in</div>
                <div className="text-muted-foreground">{item.cuFt} cu ft</div>
                <div className="text-muted-foreground">
                  {formatNumber(item.cuFt * CU_FT_TO_LITERS, 0)} L
                </div>
                <div className="text-muted-foreground">
                  {Math.ceil(item.cuFt / 1.5)} {t("common_amounts.bag_unit")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-14">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold">{t("depth_guide.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("depth_guide.description")}
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {depthGuides.map((item) => (
            <Card key={item.depth}>
              <CardHeader>
                <CardTitle className="text-base">{item.depth}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground">{item.use}</p>
                <p>{item.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold">{t("bag_tips.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("bag_tips.description")}
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {asList<TextBlock>(t.raw("bag_tips.items")).map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold">{t("faq.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("faq.description")}
          </p>
        </div>
        <Accordion type="single" collapsible className="mt-4">
          {faqs.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-left">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
