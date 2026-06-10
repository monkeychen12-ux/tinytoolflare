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
  ArrowRightLeft,
  BadgeDollarSign,
  Calculator,
  Clipboard,
  Clock3,
  DatabaseZap,
  Gauge,
  Info,
  Layers3,
  LineChart,
  RefreshCw,
  WalletCards,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type ModelKey =
  | "claude-fable-5"
  | "claude-opus-4-8"
  | "claude-opus-4-7"
  | "claude-opus-4-6"
  | "claude-sonnet-4-6"
  | "claude-haiku-4-5"
  | "custom";
type CacheMode = "none" | "5m" | "1h";
type CopyStatus = "idle" | "copied" | "failed";

interface ModelRates {
  key: ModelKey;
  label: string;
  contextWindow: number;
  input: number;
  cacheWrite5m: number;
  cacheWrite1h: number;
  cacheRead: number;
  output: number;
  note: string;
}

interface TextBlock {
  title: string;
  description: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface LineItem {
  label: string;
  tokens: number;
  rate: number;
  cost: number;
}

interface CostResult {
  cacheMode: CacheMode;
  cacheReads: number;
  contextUsed: number;
  contextPercent: number;
  effectiveRequests: number;
  errors: string[];
  lineItems: LineItem[];
  noCacheTotal: number;
  perRequest: number;
  savingsVsNoCache: number;
  total: number;
}

const MILLION = 1_000_000;

const modelPresets: ModelRates[] = [
  {
    key: "claude-fable-5",
    label: "Claude Fable 5",
    contextWindow: 1_000_000,
    input: 10,
    cacheWrite5m: 12.5,
    cacheWrite1h: 20,
    cacheRead: 1,
    output: 50,
    note: "1M context, premium Fable tier",
  },
  {
    key: "claude-opus-4-8",
    label: "Claude Opus 4.8",
    contextWindow: 1_000_000,
    input: 5,
    cacheWrite5m: 6.25,
    cacheWrite1h: 10,
    cacheRead: 0.5,
    output: 25,
    note: "1M context at standard rates",
  },
  {
    key: "claude-opus-4-7",
    label: "Claude Opus 4.7",
    contextWindow: 1_000_000,
    input: 5,
    cacheWrite5m: 6.25,
    cacheWrite1h: 10,
    cacheRead: 0.5,
    output: 25,
    note: "1M context at standard rates",
  },
  {
    key: "claude-opus-4-6",
    label: "Claude Opus 4.6",
    contextWindow: 1_000_000,
    input: 5,
    cacheWrite5m: 6.25,
    cacheWrite1h: 10,
    cacheRead: 0.5,
    output: 25,
    note: "1M context at standard rates",
  },
  {
    key: "claude-sonnet-4-6",
    label: "Claude Sonnet 4.6",
    contextWindow: 1_000_000,
    input: 3,
    cacheWrite5m: 3.75,
    cacheWrite1h: 6,
    cacheRead: 0.3,
    output: 15,
    note: "1M context beta on API",
  },
  {
    key: "claude-haiku-4-5",
    label: "Claude Haiku 4.5",
    contextWindow: 200_000,
    input: 1,
    cacheWrite5m: 1.25,
    cacheWrite1h: 2,
    cacheRead: 0.1,
    output: 5,
    note: "200K context preset",
  },
];

const defaultCustomRates: ModelRates = {
  key: "custom",
  label: "Custom model",
  contextWindow: 1_000_000,
  input: 10,
  cacheWrite5m: 12.5,
  cacheWrite1h: 20,
  cacheRead: 1,
  output: 50,
  note: "Editable rates",
};

function asList<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value && typeof value === "object") {
    return Object.values(value) as T[];
  }

  return [];
}

function parsePositiveNumber(value: string, fallback = 0) {
  if (value.trim() === "") {
    return fallback;
  }

  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : fallback;
}

function parsePositiveInteger(value: string, fallback = 0) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? Math.max(0, number) : fallback;
}

function formatMoney(value: number) {
  const fractionDigits = value >= 100 ? 0 : 2;

  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
    style: "currency",
  }).format(value);
}

function formatNumber(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}

function formatTokens(value: number) {
  if (value >= MILLION) {
    return `${formatNumber(value / MILLION, 2)}M`;
  }

  if (value >= 1_000) {
    return `${formatNumber(value / 1_000, 1)}K`;
  }

  return formatNumber(value, 0);
}

function formatRate(value: number) {
  return `$${formatNumber(value, 2)}/MTok`;
}

function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

async function writeClipboardText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      return document.execCommand("copy");
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

function getPresetModel(key: ModelKey, customRates: ModelRates) {
  if (key === "custom") {
    return customRates;
  }

  return modelPresets.find((model) => model.key === key) ?? modelPresets[0];
}

function getCacheWriteRate(model: ModelRates, cacheMode: CacheMode) {
  if (cacheMode === "5m") {
    return model.cacheWrite5m;
  }

  if (cacheMode === "1h") {
    return model.cacheWrite1h;
  }

  return model.input;
}

function getBreakEvenReads(model: ModelRates, cacheMode: Exclude<CacheMode, "none">) {
  const writeRate = getCacheWriteRate(model, cacheMode);

  for (let reads = 1; reads <= 20; reads += 1) {
    const noCache = (1 + reads) * model.input;
    const withCache = writeRate + reads * model.cacheRead;

    if (withCache < noCache) {
      return reads;
    }
  }

  return 21;
}

function calculateCost({
  batch,
  cacheMode,
  cachedTokens,
  freshInputTokens,
  model,
  outputTokens,
  requestCount,
}: {
  batch: boolean;
  cacheMode: CacheMode;
  cachedTokens: number;
  freshInputTokens: number;
  model: ModelRates;
  outputTokens: number;
  requestCount: number;
}): CostResult {
  const effectiveRequests = Math.max(1, Math.floor(requestCount));
  const cacheReads = cacheMode === "none" ? 0 : Math.max(0, effectiveRequests - 1);
  const discount = batch ? 0.5 : 1;
  const lineItems: LineItem[] = [];
  const errors: string[] = [];
  const contextUsed = freshInputTokens + cachedTokens;
  const contextPercent = model.contextWindow
    ? (contextUsed / model.contextWindow) * 100
    : 0;

  if (contextUsed > model.contextWindow) {
    errors.push("context_exceeded");
  }

  if (cacheMode === "none") {
    lineItems.push({
      label: "input",
      tokens: (freshInputTokens + cachedTokens) * effectiveRequests,
      rate: model.input * discount,
      cost:
        ((freshInputTokens + cachedTokens) *
          effectiveRequests *
          model.input *
          discount) /
        MILLION,
    });
  } else {
    lineItems.push({
      label: "fresh_input",
      tokens: freshInputTokens * effectiveRequests,
      rate: model.input * discount,
      cost: (freshInputTokens * effectiveRequests * model.input * discount) / MILLION,
    });

    lineItems.push({
      label: "cache_write",
      tokens: cachedTokens,
      rate: getCacheWriteRate(model, cacheMode) * discount,
      cost:
        (cachedTokens * getCacheWriteRate(model, cacheMode) * discount) / MILLION,
    });

    lineItems.push({
      label: "cache_read",
      tokens: cachedTokens * cacheReads,
      rate: model.cacheRead * discount,
      cost: (cachedTokens * cacheReads * model.cacheRead * discount) / MILLION,
    });
  }

  lineItems.push({
    label: "output",
    tokens: outputTokens * effectiveRequests,
    rate: model.output * discount,
    cost: (outputTokens * effectiveRequests * model.output * discount) / MILLION,
  });

  const total = lineItems.reduce((sum, item) => sum + item.cost, 0);
  const noCacheInput =
    ((freshInputTokens + cachedTokens) *
      effectiveRequests *
      model.input *
      discount) /
    MILLION;
  const noCacheOutput =
    (outputTokens * effectiveRequests * model.output * discount) / MILLION;
  const noCacheTotal = noCacheInput + noCacheOutput;

  return {
    cacheMode,
    cacheReads,
    contextUsed,
    contextPercent,
    effectiveRequests,
    errors,
    lineItems,
    noCacheTotal,
    perRequest: total / effectiveRequests,
    savingsVsNoCache: noCacheTotal - total,
    total,
  };
}

export default function AiModelCostCalculatorPage() {
  const locale = useLocale();
  const t = useTranslations(
    "tools.categories.calculator.tools.ai_model_cost_calculator"
  );
  const useCases = asList<TextBlock>(t.raw("use_cases.items"));
  const pricingNotes = asList<TextBlock>(t.raw("pricing_notes.items"));
  const faqs = asList<FaqItem>(t.raw("faq.items"));
  const customModelLabel = t("custom_model");

  const [modelKey, setModelKey] = useState<ModelKey>("claude-fable-5");
  const [compareModelKey, setCompareModelKey] =
    useState<ModelKey>("claude-opus-4-8");
  const [requestCount, setRequestCount] = useState("3");
  const [freshInputTokens, setFreshInputTokens] = useState("50000");
  const [cachedTokens, setCachedTokens] = useState("950000");
  const [outputTokens, setOutputTokens] = useState("20000");
  const [cacheMode, setCacheMode] = useState<CacheMode>("5m");
  const [batch, setBatch] = useState(false);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const [customInput, setCustomInput] = useState("10");
  const [customCacheWrite5m, setCustomCacheWrite5m] = useState("12.5");
  const [customCacheWrite1h, setCustomCacheWrite1h] = useState("20");
  const [customCacheRead, setCustomCacheRead] = useState("1");
  const [customOutput, setCustomOutput] = useState("50");
  const [customContext, setCustomContext] = useState("1000000");

  const customRates = useMemo<ModelRates>(
    () => ({
      ...defaultCustomRates,
      cacheRead: parsePositiveNumber(customCacheRead, defaultCustomRates.cacheRead),
      cacheWrite1h: parsePositiveNumber(
        customCacheWrite1h,
        defaultCustomRates.cacheWrite1h
      ),
      cacheWrite5m: parsePositiveNumber(
        customCacheWrite5m,
        defaultCustomRates.cacheWrite5m
      ),
      contextWindow: Math.max(
        1,
        parsePositiveInteger(customContext, defaultCustomRates.contextWindow)
      ),
      input: parsePositiveNumber(customInput, defaultCustomRates.input),
      label: customModelLabel,
      output: parsePositiveNumber(customOutput, defaultCustomRates.output),
    }),
    [
      customCacheRead,
      customCacheWrite1h,
      customCacheWrite5m,
      customContext,
      customInput,
      customModelLabel,
      customOutput,
    ]
  );

  const model = getPresetModel(modelKey, customRates);
  const compareModel = getPresetModel(compareModelKey, customRates);
  const showCustomRates = modelKey === "custom" || compareModelKey === "custom";
  const numericInputs = useMemo(
    () => ({
      cachedTokens: parsePositiveInteger(cachedTokens, 0),
      freshInputTokens: parsePositiveInteger(freshInputTokens, 0),
      outputTokens: parsePositiveInteger(outputTokens, 0),
      requestCount: Math.max(1, parsePositiveInteger(requestCount, 1)),
    }),
    [cachedTokens, freshInputTokens, outputTokens, requestCount]
  );

  const result = useMemo(
    () =>
      calculateCost({
        batch,
        cacheMode,
        model,
        ...numericInputs,
      }),
    [batch, cacheMode, model, numericInputs]
  );

  const compareResult = useMemo(
    () =>
      calculateCost({
        batch,
        cacheMode,
        model: compareModel,
        ...numericInputs,
      }),
    [batch, cacheMode, compareModel, numericInputs]
  );

  const breakEven5m = getBreakEvenReads(model, "5m");
  const breakEven1h = getBreakEvenReads(model, "1h");
  const comparisonDelta = result.total - compareResult.total;
  const comparisonPercent =
    compareResult.total > 0 ? (comparisonDelta / compareResult.total) * 100 : 0;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: t("title"),
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      url:
        locale === "zh"
          ? "https://www.tinytoolflare.com/zh/ai-model-cost-calculator"
          : "https://www.tinytoolflare.com/ai-model-cost-calculator",
      description: t("page_description"),
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Claude Fable 5 cost calculator",
        "AI model context cost calculator",
        "prompt cache break-even calculator",
        "batch API discount calculator",
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

  function applyPreset(preset: "one_million" | "small_agent" | "batch_eval") {
    if (preset === "one_million") {
      setRequestCount("3");
      setFreshInputTokens("50000");
      setCachedTokens("950000");
      setOutputTokens("20000");
      setCacheMode("5m");
      setBatch(false);
      return;
    }

    if (preset === "small_agent") {
      setRequestCount("10");
      setFreshInputTokens("15000");
      setCachedTokens("120000");
      setOutputTokens("8000");
      setCacheMode("1h");
      setBatch(false);
      return;
    }

    setRequestCount("500");
    setFreshInputTokens("3000");
    setCachedTokens("25000");
    setOutputTokens("1200");
    setCacheMode("5m");
    setBatch(true);
  }

  async function copySummary() {
    const summary = [
      `${t("copy_model")}: ${model.label}`,
      `${t("copy_requests")}: ${result.effectiveRequests}`,
      `${t("copy_context")}: ${formatTokens(result.contextUsed)} (${formatNumber(
        result.contextPercent,
        1
      )}%)`,
      `${t("copy_cache")}: ${t(`cache_modes.${cacheMode}`)}`,
      `${t("copy_batch")}: ${batch ? t("yes") : t("no")}`,
      `${t("copy_total")}: ${formatMoney(result.total)}`,
      `${t("copy_compare")}: ${compareModel.label} ${formatMoney(
        compareResult.total
      )}`,
    ].join("\n");

    const didCopy = await writeClipboardText(summary);
    setCopyStatus(didCopy ? "copied" : "failed");
    window.setTimeout(() => setCopyStatus("idle"), 1800);
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

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_430px]">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="size-5" />
                {t("tool_title")}
              </CardTitle>
              <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 sm:min-w-56">
                <span className="text-sm font-medium">{t("batch_label")}</span>
                <Switch
                  checked={batch}
                  onCheckedChange={setBatch}
                  aria-label={t("batch_label")}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => applyPreset("one_million")}>
                <Layers3 className="mr-2 size-4" />
                {t("preset_1m")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => applyPreset("small_agent")}
              >
                <RefreshCw className="mr-2 size-4" />
                {t("preset_agent")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => applyPreset("batch_eval")}
              >
                <Clock3 className="mr-2 size-4" />
                {t("preset_batch")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">{t("model_label")}</span>
                <Select
                  value={modelKey}
                  onValueChange={(value) => setModelKey(value as ModelKey)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelPresets.map((option) => (
                      <SelectItem key={option.key} value={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">{t("custom_model")}</SelectItem>
                  </SelectContent>
                </Select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">
                  {t("compare_model_label")}
                </span>
                <Select
                  value={compareModelKey}
                  onValueChange={(value) => setCompareModelKey(value as ModelKey)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelPresets.map((option) => (
                      <SelectItem key={option.key} value={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">{t("custom_model")}</SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </div>

            {showCustomRates && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Gauge className="size-4" />
                  {t("custom_rates_title")}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="space-y-2">
                    <span className="text-sm font-medium">{t("input_rate")}</span>
                    <Input
                      type="number"
                      min="0"
                      inputMode="decimal"
                      value={customInput}
                      onChange={(event) => setCustomInput(event.target.value)}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">
                      {t("cache_write_5m_rate")}
                    </span>
                    <Input
                      type="number"
                      min="0"
                      inputMode="decimal"
                      value={customCacheWrite5m}
                      onChange={(event) =>
                        setCustomCacheWrite5m(event.target.value)
                      }
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">
                      {t("cache_write_1h_rate")}
                    </span>
                    <Input
                      type="number"
                      min="0"
                      inputMode="decimal"
                      value={customCacheWrite1h}
                      onChange={(event) =>
                        setCustomCacheWrite1h(event.target.value)
                      }
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">
                      {t("cache_read_rate")}
                    </span>
                    <Input
                      type="number"
                      min="0"
                      inputMode="decimal"
                      value={customCacheRead}
                      onChange={(event) => setCustomCacheRead(event.target.value)}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">{t("output_rate")}</span>
                    <Input
                      type="number"
                      min="0"
                      inputMode="decimal"
                      value={customOutput}
                      onChange={(event) => setCustomOutput(event.target.value)}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">
                      {t("context_window_label")}
                    </span>
                    <Input
                      type="number"
                      min="1"
                      inputMode="numeric"
                      value={customContext}
                      onChange={(event) => setCustomContext(event.target.value)}
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="space-y-2">
                <span className="text-sm font-medium">{t("requests_label")}</span>
                <Input
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={requestCount}
                  onChange={(event) => setRequestCount(event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  {t("fresh_input_label")}
                </span>
                <Input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={freshInputTokens}
                  onChange={(event) => setFreshInputTokens(event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  {t("cached_tokens_label")}
                </span>
                <Input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={cachedTokens}
                  onChange={(event) => setCachedTokens(event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">{t("output_label")}</span>
                <Input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={outputTokens}
                  onChange={(event) => setOutputTokens(event.target.value)}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
              <label className="space-y-2">
                <span className="text-sm font-medium">{t("cache_mode_label")}</span>
                <Select
                  value={cacheMode}
                  onValueChange={(value) => setCacheMode(value as CacheMode)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("cache_modes.none")}</SelectItem>
                    <SelectItem value="5m">{t("cache_modes.5m")}</SelectItem>
                    <SelectItem value="1h">{t("cache_modes.1h")}</SelectItem>
                  </SelectContent>
                </Select>
              </label>

              <Alert>
                <Info className="size-4" />
                <AlertTitle>{t("source_title")}</AlertTitle>
                <AlertDescription>
                  {t("source_text")}{" "}
                  <a
                    href="https://platform.claude.com/docs/en/about-claude/pricing"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline underline-offset-4"
                  >
                    {t("source_link")}
                  </a>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="border-primary/25">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WalletCards className="size-5" />
                {t("results_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-primary/10 p-4">
                <div className="text-sm text-muted-foreground">{model.label}</div>
                <div className="mt-1 text-3xl font-bold">
                  {formatMoney(result.total)}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {t("per_request", { cost: formatMoney(result.perRequest) })}
                </div>
              </div>

              {result.errors.includes("context_exceeded") && (
                <Alert variant="destructive">
                  <Info className="size-4" />
                  <AlertTitle>{t("context_warning_title")}</AlertTitle>
                  <AlertDescription>
                    {t("context_warning_text", {
                      context: formatTokens(model.contextWindow),
                    })}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                {result.lineItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {t(`line_items.${item.label}`)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTokens(item.tokens)} · {formatRate(item.rate)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold">
                      {formatMoney(item.cost)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">{t("context_title")}</div>
                  <Badge variant="secondary">
                    {formatNumber(result.contextPercent, 1)}%
                  </Badge>
                </div>
                <div className="mt-3 h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{
                      width: `${Math.min(100, Math.max(0, result.contextPercent))}%`,
                    }}
                  />
                </div>
                <div className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {t("context_detail", {
                    used: formatTokens(result.contextUsed),
                    window: formatTokens(model.contextWindow),
                  })}
                </div>
              </div>

              <Button type="button" onClick={copySummary} className="w-full">
                <Clipboard className="mr-2 size-4" />
                {copyStatus === "copied" && t("copied")}
                {copyStatus === "failed" && t("copy_failed")}
                {copyStatus === "idle" && t("copy_summary")}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="size-5" />
                {t("switch_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">
                    {t("selected_model")}
                  </div>
                  <div className="font-semibold">{model.label}</div>
                  <div className="mt-1 text-xl font-bold">
                    {formatMoney(result.total)}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">
                    {t("compare_model")}
                  </div>
                  <div className="font-semibold">{compareModel.label}</div>
                  <div className="mt-1 text-xl font-bold">
                    {formatMoney(compareResult.total)}
                  </div>
                </div>
              </div>
              <Alert>
                <LineChart className="size-4" />
                <AlertTitle>{t("switch_delta_title")}</AlertTitle>
                <AlertDescription>
                  {t("switch_delta_text", {
                    amount: formatMoney(Math.abs(comparisonDelta)),
                    percent: formatNumber(Math.abs(comparisonPercent), 1),
                    direction:
                      comparisonDelta >= 0
                        ? t("more_expensive")
                        : t("less_expensive"),
                  })}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DatabaseZap className="size-5" />
                {t("cache_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">
                    {t("break_even_5m")}
                  </div>
                  <div className="text-xl font-bold">
                    {t("reads_count", { count: breakEven5m })}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">
                    {t("break_even_1h")}
                  </div>
                  <div className="text-xl font-bold">
                    {t("reads_count", { count: breakEven1h })}
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium">{t("cache_savings_title")}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {cacheMode === "none"
                    ? t("cache_disabled_text")
                    : t("cache_savings_text", {
                        amount: formatMoney(Math.max(0, result.savingsVsNoCache)),
                        noCache: formatMoney(result.noCacheTotal),
                      })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {useCases.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BadgeDollarSign className="size-4" />
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
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <CardTitle>{t("pricing_notes.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pricingNotes.map((item) => (
              <div key={item.title} className="rounded-lg border p-3">
                <div className="font-medium">{item.title}</div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("rate_table_title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {modelPresets.slice(0, 4).map((preset) => (
              <div
                key={preset.key}
                className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border p-3 text-sm"
              >
                <div>
                  <div className="font-medium">{preset.label}</div>
                  <div className="text-xs text-muted-foreground">{preset.note}</div>
                </div>
                <div className="text-right">
                  <div>{formatRate(preset.input)}</div>
                  <div className="text-xs text-muted-foreground">
                    {t("output_short", { rate: formatRate(preset.output) })}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>{t("faq.title")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("faq.description")}
            </p>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((item, index) => (
                <AccordionItem key={item.question} value={`item-${index}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
