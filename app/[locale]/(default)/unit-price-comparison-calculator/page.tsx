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
  BadgePercent,
  CircleAlert,
  Package,
  Plus,
  RotateCcw,
  ShoppingBasket,
  Trash2,
  Trophy,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type Unit = "g" | "kg" | "oz" | "lb" | "ml" | "l" | "fl_oz" | "count";
type UnitKind = "mass" | "volume" | "count";
type DiscountType = "none" | "coupon" | "percent" | "multi";

interface ProductRow {
  id: number;
  name: string;
  price: string;
  quantity: string;
  unit: Unit;
  discountType: DiscountType;
  coupon: string;
  percent: string;
  multiQuantity: string;
  multiPrice: string;
}

interface TextBlock {
  title: string;
  description: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface UnitOption {
  value: Unit;
  label: string;
  kind: UnitKind;
  baseFactor: number;
}

interface DisplayOption {
  label: string;
  kind: UnitKind;
  baseAmount: number;
}

const unitOptions: UnitOption[] = [
  { value: "oz", label: "oz", kind: "mass", baseFactor: 28.3495 },
  { value: "lb", label: "lb", kind: "mass", baseFactor: 453.592 },
  { value: "g", label: "g", kind: "mass", baseFactor: 1 },
  { value: "kg", label: "kg", kind: "mass", baseFactor: 1000 },
  { value: "fl_oz", label: "fl oz", kind: "volume", baseFactor: 29.5735 },
  { value: "ml", label: "ml", kind: "volume", baseFactor: 1 },
  { value: "l", label: "L", kind: "volume", baseFactor: 1000 },
  { value: "count", label: "count", kind: "count", baseFactor: 1 },
];

const displayOptions: Record<UnitKind, DisplayOption> = {
  mass: { label: "oz", kind: "mass", baseAmount: 28.3495 },
  volume: { label: "fl oz", kind: "volume", baseAmount: 29.5735 },
  count: { label: "item", kind: "count", baseAmount: 1 },
};

const initialRows: ProductRow[] = [
  {
    id: 1,
    name: "Small pack",
    price: "4.99",
    quantity: "12",
    unit: "oz",
    discountType: "none",
    coupon: "",
    percent: "",
    multiQuantity: "2",
    multiPrice: "",
  },
  {
    id: 2,
    name: "Family size",
    price: "8.49",
    quantity: "24",
    unit: "oz",
    discountType: "none",
    coupon: "",
    percent: "",
    multiQuantity: "2",
    multiPrice: "",
  },
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

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function getUnitOption(unit: Unit) {
  return unitOptions.find((option) => option.value === unit) ?? unitOptions[0];
}

function getEffectivePrice(row: ProductRow) {
  const price = parseNumber(row.price);
  const quantity = parseNumber(row.quantity);
  const coupon = parseNumber(row.coupon) ?? 0;
  const percent = parseNumber(row.percent) ?? 0;
  const multiQuantity = parseNumber(row.multiQuantity);
  const multiPrice = parseNumber(row.multiPrice);

  if (!price || price <= 0 || !quantity || quantity <= 0) {
    return null;
  }

  if (row.discountType === "coupon") {
    return Math.max(0, price - Math.max(0, coupon));
  }

  if (row.discountType === "percent") {
    return price * Math.max(0, 1 - Math.max(0, percent) / 100);
  }

  if (
    row.discountType === "multi" &&
    multiQuantity &&
    multiQuantity > 0 &&
    multiPrice !== null &&
    multiPrice >= 0
  ) {
    return multiPrice / multiQuantity;
  }

  return price;
}

export default function UnitPriceComparisonCalculatorPage() {
  const locale = useLocale();
  const t = useTranslations(
    "tools.categories.calculator.tools.unit_price_comparison_calculator"
  );
  const useCases = asList<TextBlock>(t.raw("use_cases.items"));
  const tips = asList<TextBlock>(t.raw("tips.items"));
  const faqs = asList<FaqItem>(t.raw("faq.items"));

  const [rows, setRows] = useState<ProductRow[]>(initialRows);
  const [shelfMode, setShelfMode] = useState(true);
  const [oldPrice, setOldPrice] = useState("4.99");
  const [oldQuantity, setOldQuantity] = useState("16");
  const [newPrice, setNewPrice] = useState("4.99");
  const [newQuantity, setNewQuantity] = useState("14");
  const [shrinkUnit, setShrinkUnit] = useState<Unit>("oz");

  const calculations = useMemo(() => {
    return rows.map((row) => {
      const unit = getUnitOption(row.unit);
      const price = parseNumber(row.price);
      const quantity = parseNumber(row.quantity);
      const effectivePackagePrice = getEffectivePrice(row);
      const baseQuantity = quantity && quantity > 0 ? quantity * unit.baseFactor : 0;
      const unitPrice =
        effectivePackagePrice !== null && baseQuantity > 0
          ? effectivePackagePrice / baseQuantity
          : null;
      const display = displayOptions[unit.kind];

      return {
        ...row,
        baseQuantity,
        display,
        effectivePackagePrice,
        kind: unit.kind,
        unitLabel: unit.label,
        unitPrice,
        unitPriceDisplay:
          unitPrice === null ? null : unitPrice * display.baseAmount,
      };
    });
  }, [rows]);

  const bestByKind = useMemo(() => {
    return calculations.reduce<Record<UnitKind, number | null>>(
      (best, row) => {
        if (row.unitPrice === null) {
          return best;
        }

        const current = best[row.kind];
        if (current === null || row.unitPrice < current) {
          best[row.kind] = row.unitPrice;
        }

        return best;
      },
      { mass: null, volume: null, count: null }
    );
  }, [calculations]);

  const unitKinds = new Set(
    calculations.filter((row) => row.unitPrice !== null).map((row) => row.kind)
  );

  const shrink = useMemo(() => {
    const unit = getUnitOption(shrinkUnit);
    const oldPriceValue = parseNumber(oldPrice);
    const oldQuantityValue = parseNumber(oldQuantity);
    const newPriceValue = parseNumber(newPrice);
    const newQuantityValue = parseNumber(newQuantity);

    if (
      !oldPriceValue ||
      !oldQuantityValue ||
      !newPriceValue ||
      !newQuantityValue ||
      oldPriceValue <= 0 ||
      oldQuantityValue <= 0 ||
      newPriceValue <= 0 ||
      newQuantityValue <= 0
    ) {
      return null;
    }

    const oldBase = oldQuantityValue * unit.baseFactor;
    const newBase = newQuantityValue * unit.baseFactor;
    const oldUnitPrice = oldPriceValue / oldBase;
    const newUnitPrice = newPriceValue / newBase;
    const display = displayOptions[unit.kind];

    return {
      display,
      oldDisplayPrice: oldUnitPrice * display.baseAmount,
      newDisplayPrice: newUnitPrice * display.baseAmount,
      sizeChange: ((newBase - oldBase) / oldBase) * 100,
      unitPriceChange: ((newUnitPrice - oldUnitPrice) / oldUnitPrice) * 100,
    };
  }, [newPrice, newQuantity, oldPrice, oldQuantity, shrinkUnit]);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: t("title"),
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      url:
        locale === "zh"
          ? "https://www.tinytoolflare.com/zh/unit-price-comparison-calculator"
          : "https://www.tinytoolflare.com/unit-price-comparison-calculator",
      description: t("page_description"),
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "unit price calculator grocery",
        "compare price per ounce",
        "coupon and multi-buy unit price comparison",
        "shrinkflation calculator",
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

  function updateRow(id: number, patch: Partial<ProductRow>) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  }

  function addRow() {
    setRows((current) => [
      ...current,
      {
        id: Math.max(...current.map((row) => row.id), 0) + 1,
        name: `${t("item_label")} ${current.length + 1}`,
        price: "",
        quantity: "",
        unit: current[0]?.unit ?? "oz",
        discountType: "none",
        coupon: "",
        percent: "",
        multiQuantity: "2",
        multiPrice: "",
      },
    ]);
  }

  function removeRow(id: number) {
    setRows((current) =>
      current.length <= 1 ? current : current.filter((row) => row.id !== id)
    );
  }

  function resetRows() {
    setRows(initialRows);
  }

  return (
    <div className="mx-auto px-4 py-6 md:max-w-7xl md:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <div className="mb-5 max-w-3xl">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBasket className="size-5" />
                {t("tool_title")}
              </CardTitle>
              <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 sm:min-w-56">
                <span className="text-sm font-medium">{t("shelf_mode")}</span>
                <Switch
                  checked={shelfMode}
                  onCheckedChange={setShelfMode}
                  aria-label={t("shelf_mode")}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={addRow} size={shelfMode ? "lg" : "default"}>
                <Plus className="mr-2 size-4" />
                {t("add_item")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetRows}
                size={shelfMode ? "lg" : "default"}
              >
                <RotateCcw className="mr-2 size-4" />
                {t("reset")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {rows.map((row, index) => (
              <div key={row.id} className="rounded-lg border p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <Badge variant="secondary">{`${t("item_label")} ${index + 1}`}</Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length <= 1}
                    aria-label={t("remove_item")}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div
                  className={
                    shelfMode
                      ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                      : "grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                  }
                >
                  <label className="space-y-2">
                    <span className="text-sm font-medium">{t("name_label")}</span>
                    <Input
                      value={row.name}
                      onChange={(event) =>
                        updateRow(row.id, { name: event.target.value })
                      }
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">{t("price_label")}</span>
                    <Input
                      type="number"
                      min="0"
                      inputMode="decimal"
                      value={row.price}
                      onChange={(event) =>
                        updateRow(row.id, { price: event.target.value })
                      }
                      className={shelfMode ? "h-12 text-lg" : undefined}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">
                      {t("quantity_label")}
                    </span>
                    <Input
                      type="number"
                      min="0"
                      inputMode="decimal"
                      value={row.quantity}
                      onChange={(event) =>
                        updateRow(row.id, { quantity: event.target.value })
                      }
                      className={shelfMode ? "h-12 text-lg" : undefined}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">{t("unit_label")}</span>
                    <Select
                      value={row.unit}
                      onValueChange={(value) =>
                        updateRow(row.id, { unit: value as Unit })
                      }
                    >
                      <SelectTrigger className={shelfMode ? "h-12" : undefined}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {unitOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr]">
                  <label className="space-y-2">
                    <span className="text-sm font-medium">
                      {t("discount_type")}
                    </span>
                    <Select
                      value={row.discountType}
                      onValueChange={(value) =>
                        updateRow(row.id, {
                          discountType: value as DiscountType,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t("discount_none")}</SelectItem>
                        <SelectItem value="coupon">
                          {t("discount_coupon")}
                        </SelectItem>
                        <SelectItem value="percent">
                          {t("discount_percent")}
                        </SelectItem>
                        <SelectItem value="multi">{t("discount_multi")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>

                  {row.discountType === "coupon" && (
                    <label className="space-y-2">
                      <span className="text-sm font-medium">
                        {t("coupon_label")}
                      </span>
                      <Input
                        type="number"
                        min="0"
                        inputMode="decimal"
                        value={row.coupon}
                        onChange={(event) =>
                          updateRow(row.id, { coupon: event.target.value })
                        }
                      />
                    </label>
                  )}

                  {row.discountType === "percent" && (
                    <label className="space-y-2">
                      <span className="text-sm font-medium">
                        {t("percent_label")}
                      </span>
                      <Input
                        type="number"
                        min="0"
                        inputMode="decimal"
                        value={row.percent}
                        onChange={(event) =>
                          updateRow(row.id, { percent: event.target.value })
                        }
                      />
                    </label>
                  )}

                  {row.discountType === "multi" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-sm font-medium">
                          {t("multi_quantity")}
                        </span>
                        <Input
                          type="number"
                          min="1"
                          inputMode="decimal"
                          value={row.multiQuantity}
                          onChange={(event) =>
                            updateRow(row.id, {
                              multiQuantity: event.target.value,
                            })
                          }
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium">
                          {t("multi_price")}
                        </span>
                        <Input
                          type="number"
                          min="0"
                          inputMode="decimal"
                          value={row.multiPrice}
                          onChange={(event) =>
                            updateRow(row.id, { multiPrice: event.target.value })
                          }
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="border-primary/25">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="size-5" />
                {t("results_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {unitKinds.size > 1 && (
                <Alert>
                  <CircleAlert className="size-4" />
                  <AlertTitle>{t("mixed_units_title")}</AlertTitle>
                  <AlertDescription>{t("mixed_units_description")}</AlertDescription>
                </Alert>
              )}

              {calculations.map((row) => {
                const isBest =
                  row.unitPrice !== null &&
                  bestByKind[row.kind] !== null &&
                  Math.abs(row.unitPrice - (bestByKind[row.kind] ?? 0)) < 0.0000001;

                return (
                  <div
                    key={row.id}
                    className={
                      isBest
                        ? "rounded-lg border border-primary bg-primary/5 p-4"
                        : "rounded-lg border p-4"
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">
                          {row.name || t("unnamed_item")}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {row.effectivePackagePrice === null
                            ? t("needs_input")
                            : t("effective_package", {
                                price: formatMoney(row.effectivePackagePrice),
                              })}
                        </div>
                      </div>
                      {isBest && (
                        <Badge>
                          <Trophy className="mr-1 size-3" />
                          {t("best_value")}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-bold">
                        {row.unitPriceDisplay === null
                          ? "-"
                          : `$${formatMoney(row.unitPriceDisplay)}`}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {t("per_unit", { unit: row.display.label })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgePercent className="size-5" />
                {t("shrink_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-2">
                  <span className="text-sm font-medium">{t("old_price")}</span>
                  <Input
                    type="number"
                    min="0"
                    value={oldPrice}
                    onChange={(event) => setOldPrice(event.target.value)}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">{t("old_size")}</span>
                  <Input
                    type="number"
                    min="0"
                    value={oldQuantity}
                    onChange={(event) => setOldQuantity(event.target.value)}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">{t("new_price")}</span>
                  <Input
                    type="number"
                    min="0"
                    value={newPrice}
                    onChange={(event) => setNewPrice(event.target.value)}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">{t("new_size")}</span>
                  <Input
                    type="number"
                    min="0"
                    value={newQuantity}
                    onChange={(event) => setNewQuantity(event.target.value)}
                  />
                </label>
              </div>
              <label className="block space-y-2">
                <span className="text-sm font-medium">{t("shrink_unit")}</span>
                <Select
                  value={shrinkUnit}
                  onValueChange={(value) => setShrinkUnit(value as Unit)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="text-xs text-muted-foreground">
                    {t("size_change")}
                  </div>
                  <div className="mt-1 text-2xl font-bold">
                    {shrink ? `${formatNumber(shrink.sizeChange, 1)}%` : "-"}
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-xs text-muted-foreground">
                    {t("unit_price_change")}
                  </div>
                  <div className="mt-1 text-2xl font-bold">
                    {shrink
                      ? `${formatNumber(shrink.unitPriceChange, 1)}%`
                      : "-"}
                  </div>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {shrink
                  ? t("shrink_summary", {
                      oldPrice: formatMoney(shrink.oldDisplayPrice),
                      newPrice: formatMoney(shrink.newDisplayPrice),
                      unit: shrink.display.label,
                    })
                  : t("shrink_empty")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {useCases.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="size-4" />
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">{t("tips.title")}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {t("tips.description")}
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {tips.map((item) => (
            <div key={item.title} className="rounded-lg border p-4">
              <div className="font-medium">{item.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">{t("faq.title")}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {t("faq.description")}
        </p>
        <Accordion type="single" collapsible className="mt-4">
          {faqs.map((item, index) => (
            <AccordionItem key={item.question} value={`item-${index}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
