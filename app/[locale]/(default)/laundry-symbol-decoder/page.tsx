"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Ban,
  CheckCircle2,
  Circle,
  Copy,
  Droplets,
  Minus,
  RotateCcw,
  Shirt,
  Sparkles,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type BaseSymbol = "wash" | "bleach" | "tumble_dry" | "iron" | "dry_clean";
type DryCleanLetter = "none" | "P" | "F" | "W";
type DotCount = 0 | 1 | 2 | 3;
type LineCount = 0 | 1 | 2;

interface TextBlock {
  title: string;
  description: string;
}

interface LookupRow {
  symbol: string;
  meaning: string;
  advice: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface Selection {
  base: BaseSymbol;
  blocked: boolean;
  dots: DotCount;
  lines: LineCount;
  letter: DryCleanLetter;
}

interface BaseOption {
  key: BaseSymbol;
  supportsDots: boolean;
  supportsLines: boolean;
  supportsLetter: boolean;
}

const baseOptions: BaseOption[] = [
  { key: "wash", supportsDots: true, supportsLines: true, supportsLetter: false },
  {
    key: "bleach",
    supportsDots: false,
    supportsLines: true,
    supportsLetter: false,
  },
  {
    key: "tumble_dry",
    supportsDots: true,
    supportsLines: true,
    supportsLetter: false,
  },
  { key: "iron", supportsDots: true, supportsLines: false, supportsLetter: false },
  {
    key: "dry_clean",
    supportsDots: false,
    supportsLines: true,
    supportsLetter: true,
  },
];

const quickPresets: Array<Selection & { key: string }> = [
  {
    key: "triangle_x",
    base: "bleach",
    blocked: true,
    dots: 0,
    lines: 0,
    letter: "none",
  },
  {
    key: "circle_p",
    base: "dry_clean",
    blocked: false,
    dots: 0,
    lines: 0,
    letter: "P",
  },
  {
    key: "wash_one_line",
    base: "wash",
    blocked: false,
    dots: 0,
    lines: 1,
    letter: "none",
  },
  {
    key: "wash_two_dots",
    base: "wash",
    blocked: false,
    dots: 2,
    lines: 0,
    letter: "none",
  },
  {
    key: "tumble_dry_x",
    base: "tumble_dry",
    blocked: true,
    dots: 0,
    lines: 0,
    letter: "none",
  },
  {
    key: "iron_one_dot",
    base: "iron",
    blocked: false,
    dots: 1,
    lines: 0,
    letter: "none",
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

function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function getDotKey(dots: DotCount) {
  return dots === 0 ? "none" : dots === 1 ? "one" : dots === 2 ? "two" : "three";
}

function getLineKey(lines: LineCount) {
  return lines === 0 ? "none" : lines === 1 ? "one" : "two";
}

function getBaseOption(base: BaseSymbol) {
  return baseOptions.find((option) => option.key === base) ?? baseOptions[0];
}

function buildDecodedAdvice(
  selection: Selection,
  t: ReturnType<typeof useTranslations>
) {
  if (selection.blocked) {
    return t(`rules.blocked.${selection.base}`);
  }

  if (selection.base === "wash") {
    return t("rules.wash.advice", {
      temperature: t(`rules.wash_temperature.${getDotKey(selection.dots)}`),
      process: t(`rules.process.${getLineKey(selection.lines)}`),
    });
  }

  if (selection.base === "bleach") {
    return selection.lines > 0
      ? t("rules.bleach.non_chlorine")
      : t("rules.bleach.allowed");
  }

  if (selection.base === "tumble_dry") {
    return t("rules.tumble_dry.advice", {
      heat: t(`rules.tumble_heat.${getDotKey(selection.dots)}`),
      process: t(`rules.process.${getLineKey(selection.lines)}`),
    });
  }

  if (selection.base === "iron") {
    return t("rules.iron.advice", {
      heat: t(`rules.iron_heat.${getDotKey(selection.dots)}`),
    });
  }

  return t("rules.dry_clean.advice", {
    method: t(`rules.dry_clean_methods.${selection.letter}`),
    process: t(`rules.process.${getLineKey(selection.lines)}`),
  });
}

function getSelectionParts(
  selection: Selection,
  t: ReturnType<typeof useTranslations>
) {
  const option = getBaseOption(selection.base);
  const parts = [t(`base_symbols.${selection.base}.label`)];

  if (selection.blocked) {
    parts.push(t("parts.x"));
  }

  if (option.supportsDots && selection.dots > 0) {
    parts.push(t(`dot_options.${getDotKey(selection.dots)}`));
  }

  if (option.supportsLines && selection.lines > 0) {
    parts.push(t(`line_options.${getLineKey(selection.lines)}`));
  }

  if (option.supportsLetter && selection.letter !== "none") {
    parts.push(t("parts.letter", { letter: selection.letter }));
  }

  return parts;
}

function SymbolPreview({
  selection,
  compact = false,
}: {
  selection: Selection;
  compact?: boolean;
}) {
  const sizeClass = compact ? "size-14" : "size-48";
  const strokeWidth = compact ? 5 : 4.5;
  const dotPositions: Record<DotCount, Array<[number, number]>> = {
    0: [],
    1: [[56, 56]],
    2: [
      [48, 56],
      [64, 56],
    ],
    3: [
      [44, 60],
      [56, 50],
      [68, 60],
    ],
  };
  const dots = dotPositions[selection.dots];
  const lineYs = selection.lines === 1 ? [92] : selection.lines === 2 ? [88, 96] : [];

  return (
    <svg
      viewBox="0 0 112 112"
      aria-hidden="true"
      className={cn(sizeClass, "shrink-0 text-foreground")}
      fill="none"
    >
      {selection.base === "wash" && (
        <>
          <path
            d="M22 34h68l-8 42H30L22 34Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
          />
          <path
            d="M30 42c6 4 12 4 18 0s12-4 18 0 12 4 18 0"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={strokeWidth - 1}
          />
        </>
      )}

      {selection.base === "bleach" && (
        <>
          <path
            d="M56 23 92 79H20L56 23Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
          />
          {selection.lines > 0 && (
            <>
              <path
                d="M45 72 58 44"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth={strokeWidth - 1}
              />
              <path
                d="M58 72 71 44"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth={strokeWidth - 1}
              />
              {selection.lines === 2 && (
                <path
                  d="M32 72 45 44"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth={strokeWidth - 1}
                />
              )}
            </>
          )}
        </>
      )}

      {selection.base === "tumble_dry" && (
        <>
          <rect
            x="24"
            y="24"
            width="64"
            height="64"
            rx="6"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
          <circle
            cx="56"
            cy="56"
            r="24"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        </>
      )}

      {selection.base === "iron" && (
        <>
          <path
            d="M22 76h60l9-22H34c-7 0-12 5-12 12v10Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
          />
          <path
            d="M39 54V40h18c14 0 26 7 31 18"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
          />
          <path
            d="M30 76h-8"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        </>
      )}

      {selection.base === "dry_clean" && (
        <>
          <circle
            cx="56"
            cy="54"
            r="33"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
          {selection.letter !== "none" && (
            <text
              x="56"
              y="64"
              fill="currentColor"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontSize="28"
              fontWeight="700"
              textAnchor="middle"
            >
              {selection.letter}
            </text>
          )}
        </>
      )}

      {(selection.base === "wash" ||
        selection.base === "tumble_dry" ||
        selection.base === "dry_clean") &&
        lineYs.map((y) => (
          <path
            key={y}
            d={`M36 ${y}h40`}
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        ))}

      {(selection.base === "wash" ||
        selection.base === "tumble_dry" ||
        selection.base === "iron") &&
        dots.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4.5" fill="currentColor" />
        ))}

      {selection.blocked && (
        <>
          <path
            d="M24 24 88 88"
            stroke="#dc2626"
            strokeLinecap="round"
            strokeWidth={strokeWidth + 1}
          />
          <path
            d="M88 24 24 88"
            stroke="#dc2626"
            strokeLinecap="round"
            strokeWidth={strokeWidth + 1}
          />
        </>
      )}
    </svg>
  );
}

export default function LaundrySymbolDecoderPage() {
  const locale = useLocale();
  const t = useTranslations("tools.categories.life.tools.laundry_symbol_decoder");
  const useCases = asList<TextBlock>(t.raw("use_cases.items"));
  const lookupRows = asList<LookupRow>(t.raw("lookup_table.items"));
  const faqs = asList<FaqItem>(t.raw("faq.items"));
  const [selection, setSelection] = useState<Selection>({
    base: "wash",
    blocked: false,
    dots: 1,
    lines: 0,
    letter: "none",
  });
  const [copied, setCopied] = useState(false);

  const selectedOption = getBaseOption(selection.base);
  const advice = useMemo(() => buildDecodedAdvice(selection, t), [selection, t]);
  const parts = useMemo(() => getSelectionParts(selection, t), [selection, t]);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: t("title"),
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      url:
        locale === "zh"
          ? "https://www.tinytoolflare.com/zh/laundry-symbol-decoder"
          : "https://www.tinytoolflare.com/laundry-symbol-decoder",
      description: t("page_description"),
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "laundry symbol decoder",
        "clothing care label decoder",
        "triangle with x laundry symbol",
        "circle P laundry symbol",
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

  function updateBase(base: BaseSymbol) {
    const option = getBaseOption(base);

    setSelection((current) => ({
      ...current,
      base,
      dots: option.supportsDots ? current.dots : 0,
      lines: option.supportsLines ? current.lines : 0,
      letter: option.supportsLetter ? current.letter : "none",
    }));
  }

  async function copyAdvice() {
    await navigator.clipboard.writeText(advice);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,560px)_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shirt className="size-5" />
              {t("tool_title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section aria-labelledby="base-symbol-title">
              <h2 id="base-symbol-title" className="text-sm font-semibold">
                {t("base_title")}
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {baseOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    aria-pressed={selection.base === option.key}
                    onClick={() => updateBase(option.key)}
                    className={cn(
                      "flex min-h-[92px] items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary",
                      selection.base === option.key
                        ? "border-primary bg-primary/5"
                        : "bg-background"
                    )}
                  >
                    <SymbolPreview
                      compact
                      selection={{
                        base: option.key,
                        blocked: false,
                        dots: option.supportsDots ? 1 : 0,
                        lines: 0,
                        letter: option.key === "dry_clean" ? "P" : "none",
                      }}
                    />
                    <span>
                      <span className="block text-sm font-semibold">
                        {t(`base_symbols.${option.key}.label`)}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        {t(`base_symbols.${option.key}.description`)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section aria-labelledby="modifier-title" className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 id="modifier-title" className="text-sm font-semibold">
                  {t("modifier_title")}
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSelection({
                      base: "wash",
                      blocked: false,
                      dots: 1,
                      lines: 0,
                      letter: "none",
                    })
                  }
                >
                  <RotateCcw className="size-4" />
                  {t("reset")}
                </Button>
              </div>

              <Button
                type="button"
                variant={selection.blocked ? "destructive" : "outline"}
                className="w-full justify-start"
                onClick={() =>
                  setSelection((current) => ({
                    ...current,
                    blocked: !current.blocked,
                  }))
                }
              >
                <Ban className="size-4" />
                {t("cross_label")}
              </Button>

              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Droplets className="size-4" />
                  {t("dots_title")}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {([0, 1, 2, 3] as DotCount[]).map((dots) => (
                    <Button
                      key={dots}
                      type="button"
                      variant={selection.dots === dots ? "default" : "outline"}
                      disabled={!selectedOption.supportsDots}
                      onClick={() =>
                        setSelection((current) => ({ ...current, dots }))
                      }
                    >
                      {t(`dot_options.${getDotKey(dots)}`)}
                    </Button>
                  ))}
                </div>
                {!selectedOption.supportsDots && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t("dots_not_used")}
                  </p>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Minus className="size-4" />
                  {t("lines_title")}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {([0, 1, 2] as LineCount[]).map((lines) => (
                    <Button
                      key={lines}
                      type="button"
                      variant={selection.lines === lines ? "default" : "outline"}
                      disabled={!selectedOption.supportsLines}
                      onClick={() =>
                        setSelection((current) => ({ ...current, lines }))
                      }
                    >
                      {t(`line_options.${getLineKey(lines)}`)}
                    </Button>
                  ))}
                </div>
                {!selectedOption.supportsLines && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t("lines_not_used")}
                  </p>
                )}
              </div>

              {selectedOption.supportsLetter && (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Circle className="size-4" />
                    {t("letter_title")}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {(["none", "P", "F", "W"] as DryCleanLetter[]).map(
                      (letter) => (
                        <Button
                          key={letter}
                          type="button"
                          variant={
                            selection.letter === letter ? "default" : "outline"
                          }
                          onClick={() =>
                            setSelection((current) => ({ ...current, letter }))
                          }
                        >
                          {letter === "none" ? t("no_letter") : letter}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              )}
            </section>

            <section aria-labelledby="quick-title">
              <h2 id="quick-title" className="text-sm font-semibold">
                {t("quick_title")}
              </h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {quickPresets.map((preset) => (
                  <Button
                    key={preset.key}
                    type="button"
                    variant="outline"
                    className="h-auto min-h-11 justify-start whitespace-normal text-left"
                    onClick={() => {
                      setSelection({
                        base: preset.base,
                        blocked: preset.blocked,
                        dots: preset.dots,
                        lines: preset.lines,
                        letter: preset.letter,
                      });
                    }}
                  >
                    <Sparkles className="size-4" />
                    {t(`quick_presets.${preset.key}`)}
                  </Button>
                ))}
              </div>
            </section>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CheckCircle2 className="size-5" />
                {t("result_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/30 p-6">
                <SymbolPreview selection={selection} />
              </div>

              <div className="rounded-lg border bg-primary/5 p-4">
                <p className="text-sm font-medium text-primary">
                  {t("care_advice")}
                </p>
                <p className="mt-2 text-2xl font-semibold leading-snug">
                  {advice}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">{t("parts_title")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {parts.map((part) => (
                    <span
                      key={part}
                      className="rounded-md border bg-background px-2.5 py-1 text-xs font-medium"
                    >
                      {part}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={copyAdvice}>
                  <Copy className="size-4" />
                  {copied ? t("copied") : t("copy")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("privacy_title")}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              {t("privacy_text")}
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
          <h2 className="text-2xl font-bold">{t("lookup_table.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("lookup_table.description")}
          </p>
        </div>
        <div className="mt-6 overflow-hidden rounded-lg border">
          <div className="grid min-w-[720px] grid-cols-[1.1fr_1.2fr_1.7fr] bg-muted px-4 py-3 text-sm font-medium">
            <div>{t("lookup_table.symbol")}</div>
            <div>{t("lookup_table.meaning")}</div>
            <div>{t("lookup_table.advice")}</div>
          </div>
          <div className="overflow-x-auto">
            {lookupRows.map((row) => (
              <div
                key={row.symbol}
                className="grid min-w-[720px] grid-cols-[1.1fr_1.2fr_1.7fr] border-t px-4 py-3 text-sm"
              >
                <div className="font-medium">{row.symbol}</div>
                <div className="text-muted-foreground">{row.meaning}</div>
                <div className="text-muted-foreground">{row.advice}</div>
              </div>
            ))}
          </div>
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
