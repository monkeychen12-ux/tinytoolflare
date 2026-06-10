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
  Calculator,
  Clipboard,
  Fence,
  Grid2X2,
  Hammer,
  ListChecks,
  Printer,
  Ruler,
  TriangleAlert,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

const FT_TO_IN = 12;
const M_TO_IN = 39.3700787402;
const CM_TO_IN = 0.3937007874;
const IN_TO_CM = 2.54;
const FT_TO_M = 0.3048;
const MAX_PREVIEW_BAYS = 6;

type UnitMode = "imperial" | "metric";
type LayoutMode = "vertical" | "horizontal";

interface TextBlock {
  title: string;
  description: string;
}

interface GuideRow {
  item: string;
  value: string;
  note: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface MaterialRow {
  item: string;
  qty: string;
  note: string;
}

interface Calculation {
  actualGapIn: number;
  bayCount: number;
  bayOpeningIn: number;
  baySpanIn: number;
  errors: string[];
  fenceHeightIn: number;
  gatePosts: number;
  gateTotalIn: number;
  linePosts: number;
  netRunIn: number;
  notices: string[];
  pieceLabel: string;
  piecesPerBay: number;
  railBoards: number;
  railPieces: number;
  slatBoards: number;
  stockLengthIn: number;
  totalPieces: number;
  totalPosts: number;
  totalRunIn: number;
  wasteMultiplier: number;
}

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

function parseInteger(value: string) {
  const number = Number.parseInt(value, 10);

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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getLargeUnitLabel(unitMode: UnitMode) {
  return unitMode === "imperial" ? "ft" : "m";
}

function getSmallUnitLabel(unitMode: UnitMode) {
  return unitMode === "imperial" ? "in" : "cm";
}

function largeToInches(value: number, unitMode: UnitMode) {
  return unitMode === "imperial" ? value * FT_TO_IN : value * M_TO_IN;
}

function smallToInches(value: number, unitMode: UnitMode) {
  return unitMode === "imperial" ? value : value * CM_TO_IN;
}

function formatLargeLength(valueIn: number, unitMode: UnitMode) {
  if (unitMode === "imperial") {
    return `${formatNumber(valueIn / FT_TO_IN, 2)} ft`;
  }

  return `${formatNumber(valueIn / M_TO_IN, 2)} m`;
}

function formatSmallLength(valueIn: number, unitMode: UnitMode) {
  if (unitMode === "imperial") {
    return `${formatNumber(valueIn, 2)} in`;
  }

  return `${formatNumber(valueIn * IN_TO_CM, 1)} cm`;
}

function getPieceCount({
  availableIn,
  pieceIn,
  targetGapIn,
}: {
  availableIn: number;
  pieceIn: number;
  targetGapIn: number;
}) {
  if (availableIn <= 0 || pieceIn <= 0) {
    return 0;
  }

  const estimated = Math.max(
    1,
    Math.round((availableIn - targetGapIn) / (pieceIn + targetGapIn))
  );
  let count = estimated;

  while (count > 1 && availableIn - count * pieceIn <= 0) {
    count -= 1;
  }

  return count;
}

function buildMaterialRows({
  calculation,
  layoutMode,
  t,
  unitMode,
}: {
  calculation: Calculation;
  layoutMode: LayoutMode;
  t: ReturnType<typeof useTranslations>;
  unitMode: UnitMode;
}): MaterialRow[] {
  if (calculation.errors.length > 0) {
    return [];
  }

  const materialRows: MaterialRow[] = [
    {
      item: t("materials.line_posts"),
      qty: calculation.linePosts.toString(),
      note: t("materials.line_posts_note", {
        spacing: formatLargeLength(calculation.baySpanIn, unitMode),
      }),
    },
    {
      item: t("materials.gate_posts"),
      qty: calculation.gatePosts.toString(),
      note: t("materials.gate_posts_note"),
    },
  ];

  if (layoutMode === "vertical") {
    materialRows.push(
      {
        item: t("materials.pickets"),
        qty: Math.ceil(
          calculation.totalPieces * calculation.wasteMultiplier
        ).toString(),
        note: t("materials.pickets_note", {
          eachBay: calculation.piecesPerBay,
          waste: formatNumber((calculation.wasteMultiplier - 1) * 100, 0),
        }),
      },
      {
        item: t("materials.rails"),
        qty: calculation.railBoards.toString(),
        note: t("materials.rails_note", {
          pieces: calculation.railPieces,
          stock: formatLargeLength(calculation.stockLengthIn, unitMode),
        }),
      }
    );
  } else {
    materialRows.push({
      item: t("materials.slats"),
      qty: calculation.slatBoards.toString(),
      note: t("materials.slats_note", {
        pieces: calculation.totalPieces,
        stock: formatLargeLength(calculation.stockLengthIn, unitMode),
        waste: formatNumber((calculation.wasteMultiplier - 1) * 100, 0),
      }),
    });
  }

  materialRows.push({
    item: t("materials.total_posts"),
    qty: calculation.totalPosts.toString(),
    note: t("materials.total_posts_note"),
  });

  return materialRows;
}

export default function FencePicketSpacingCalculatorPage() {
  const t = useTranslations(
    "tools.categories.calculator.tools.fence_picket_spacing_calculator"
  );
  const useCases = asList<TextBlock>(t.raw("use_cases.items"));
  const guideRows = asList<GuideRow>(t.raw("planning_guide.items"));
  const faqs = asList<FaqItem>(t.raw("faq.items"));

  const [unitMode, setUnitMode] = useState<UnitMode>("imperial");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("vertical");
  const [runLength, setRunLength] = useState("48");
  const [gateCount, setGateCount] = useState("1");
  const [gateWidth, setGateWidth] = useState("4");
  const [maxPostSpacing, setMaxPostSpacing] = useState("8");
  const [postWidth, setPostWidth] = useState("3.5");
  const [picketWidth, setPicketWidth] = useState("5.5");
  const [targetGap, setTargetGap] = useState("0.25");
  const [fenceHeight, setFenceHeight] = useState("72");
  const [stockLength, setStockLength] = useState("8");
  const [railsPerBay, setRailsPerBay] = useState("2");
  const [wastePercent, setWastePercent] = useState("10");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle"
  );

  const largeUnit = getLargeUnitLabel(unitMode);
  const smallUnit = getSmallUnitLabel(unitMode);

  const calculation = useMemo<Calculation>(() => {
    const runValue = parseNumber(runLength);
    const gateCountValue = parseInteger(gateCount);
    const gateWidthValue = parseNumber(gateWidth);
    const maxPostSpacingValue = parseNumber(maxPostSpacing);
    const postWidthValue = parseNumber(postWidth);
    const picketWidthValue = parseNumber(picketWidth);
    const targetGapValue = parseNumber(targetGap);
    const fenceHeightValue = parseNumber(fenceHeight);
    const stockLengthValue = parseNumber(stockLength);
    const railsPerBayValue = parseInteger(railsPerBay);
    const wasteValue = parseNumber(wastePercent);
    const errors: string[] = [];
    const notices: string[] = [];

    if (!runValue || runValue <= 0) {
      errors.push(t("validation.run_length"));
    }

    if (gateCountValue === null || gateCountValue < 0) {
      errors.push(t("validation.gate_count"));
    }

    if (gateWidthValue === null || gateWidthValue < 0) {
      errors.push(t("validation.gate_width"));
    }

    if (!maxPostSpacingValue || maxPostSpacingValue <= 0) {
      errors.push(t("validation.post_spacing"));
    }

    if (!postWidthValue || postWidthValue <= 0) {
      errors.push(t("validation.post_width"));
    }

    if (!picketWidthValue || picketWidthValue <= 0) {
      errors.push(
        layoutMode === "vertical"
          ? t("validation.picket_width")
          : t("validation.slat_height")
      );
    }

    if (targetGapValue === null || targetGapValue < 0) {
      errors.push(t("validation.target_gap"));
    }

    if (!fenceHeightValue || fenceHeightValue <= 0) {
      errors.push(t("validation.fence_height"));
    }

    if (!stockLengthValue || stockLengthValue <= 0) {
      errors.push(t("validation.stock_length"));
    }

    if (!railsPerBayValue || railsPerBayValue < 1) {
      errors.push(t("validation.rails"));
    }

    if (wasteValue === null || wasteValue < 0) {
      errors.push(t("validation.waste"));
    }

    const totalRunIn = runValue ? largeToInches(runValue, unitMode) : 0;
    const gateTotalIn =
      (gateCountValue ?? 0) *
      (gateWidthValue ? largeToInches(gateWidthValue, unitMode) : 0);
    const netRunIn = Math.max(0, totalRunIn - gateTotalIn);
    const maxPostSpacingIn = maxPostSpacingValue
      ? largeToInches(maxPostSpacingValue, unitMode)
      : 0;
    const postWidthIn = postWidthValue
      ? smallToInches(postWidthValue, unitMode)
      : 0;
    const pieceIn = picketWidthValue
      ? smallToInches(picketWidthValue, unitMode)
      : 0;
    const targetGapIn =
      targetGapValue === null ? 0 : smallToInches(targetGapValue, unitMode);
    const fenceHeightIn = fenceHeightValue
      ? smallToInches(fenceHeightValue, unitMode)
      : 0;
    const stockLengthIn = stockLengthValue
      ? largeToInches(stockLengthValue, unitMode)
      : 0;
    const wasteMultiplier = 1 + (wasteValue ?? 0) / 100;

    if (totalRunIn > 0 && gateTotalIn >= totalRunIn) {
      errors.push(t("validation.gate_too_large"));
    }

    const bayCount =
      errors.length === 0 && netRunIn > 0 && maxPostSpacingIn > 0
        ? Math.max(1, Math.ceil(netRunIn / maxPostSpacingIn))
        : 0;
    const baySpanIn = bayCount > 0 ? netRunIn / bayCount : 0;
    const bayOpeningIn = Math.max(0, baySpanIn - postWidthIn);

    if (errors.length === 0 && bayOpeningIn <= 0) {
      errors.push(t("validation.no_bay_opening"));
    }

    const piecesPerBay =
      layoutMode === "vertical"
        ? getPieceCount({
            availableIn: bayOpeningIn,
            pieceIn,
            targetGapIn,
          })
        : getPieceCount({
            availableIn: fenceHeightIn,
            pieceIn,
            targetGapIn,
          });
    const availableForGaps =
      layoutMode === "vertical" ? bayOpeningIn : fenceHeightIn;
    const actualGapIn =
      piecesPerBay > 0
        ? (availableForGaps - piecesPerBay * pieceIn) / (piecesPerBay + 1)
        : 0;

    if (errors.length === 0 && actualGapIn < 0) {
      errors.push(t("validation.piece_too_large"));
    }

    if (
      errors.length === 0 &&
      targetGapIn > 0 &&
      (actualGapIn > targetGapIn * 2.25 || actualGapIn < targetGapIn * 0.45)
    ) {
      notices.push(t("validation.gap_notice"));
    }

    if (errors.length === 0 && baySpanIn > maxPostSpacingIn * 0.98) {
      notices.push(t("validation.spacing_near_limit"));
    }

    const totalPieces = piecesPerBay * bayCount;
    const linePosts = bayCount > 0 ? bayCount + 1 : 0;
    const gatePosts = (gateCountValue ?? 0) * 2;
    const railPieces = bayCount * (railsPerBayValue ?? 0);
    const railLinearIn = bayOpeningIn * (railsPerBayValue ?? 0) * bayCount;
    const railBoards =
      stockLengthIn > 0 ? Math.ceil((railLinearIn / stockLengthIn) * wasteMultiplier) : 0;
    const horizontalLinearIn = bayOpeningIn * piecesPerBay * bayCount;
    const slatBoards =
      stockLengthIn > 0
        ? Math.ceil((horizontalLinearIn / stockLengthIn) * wasteMultiplier)
        : 0;

    return {
      actualGapIn,
      bayCount,
      bayOpeningIn,
      baySpanIn,
      errors,
      fenceHeightIn,
      gatePosts,
      gateTotalIn,
      linePosts,
      netRunIn,
      notices,
      pieceLabel:
        layoutMode === "vertical" ? t("piece_picket") : t("piece_slat"),
      piecesPerBay,
      railBoards,
      railPieces,
      slatBoards,
      stockLengthIn,
      totalPieces,
      totalPosts: linePosts + gatePosts,
      totalRunIn,
      wasteMultiplier,
    };
  }, [
    fenceHeight,
    gateCount,
    gateWidth,
    layoutMode,
    maxPostSpacing,
    picketWidth,
    postWidth,
    railsPerBay,
    runLength,
    stockLength,
    t,
    targetGap,
    unitMode,
    wastePercent,
  ]);

  const materialRows = useMemo(
    () => buildMaterialRows({ calculation, layoutMode, t, unitMode }),
    [calculation, layoutMode, t, unitMode]
  );

  function handleUnitModeChange(nextMode: UnitMode) {
    if (nextMode === unitMode) {
      return;
    }

    const runValue = parseNumber(runLength) ?? 0;
    const gateWidthValue = parseNumber(gateWidth) ?? 0;
    const maxPostSpacingValue = parseNumber(maxPostSpacing) ?? 0;
    const postWidthValue = parseNumber(postWidth) ?? 0;
    const picketWidthValue = parseNumber(picketWidth) ?? 0;
    const targetGapValue = parseNumber(targetGap) ?? 0;
    const fenceHeightValue = parseNumber(fenceHeight) ?? 0;
    const stockLengthValue = parseNumber(stockLength) ?? 0;

    if (nextMode === "metric") {
      setRunLength(formatInputNumber(runValue * FT_TO_M, 2));
      setGateWidth(formatInputNumber(gateWidthValue * FT_TO_M, 2));
      setMaxPostSpacing(formatInputNumber(maxPostSpacingValue * FT_TO_M, 2));
      setPostWidth(formatInputNumber(postWidthValue * IN_TO_CM, 1));
      setPicketWidth(formatInputNumber(picketWidthValue * IN_TO_CM, 1));
      setTargetGap(formatInputNumber(targetGapValue * IN_TO_CM, 1));
      setFenceHeight(formatInputNumber(fenceHeightValue * IN_TO_CM, 1));
      setStockLength(formatInputNumber(stockLengthValue * FT_TO_M, 2));
    } else {
      setRunLength(formatInputNumber(runValue / FT_TO_M, 2));
      setGateWidth(formatInputNumber(gateWidthValue / FT_TO_M, 2));
      setMaxPostSpacing(formatInputNumber(maxPostSpacingValue / FT_TO_M, 2));
      setPostWidth(formatInputNumber(postWidthValue / IN_TO_CM, 2));
      setPicketWidth(formatInputNumber(picketWidthValue / IN_TO_CM, 2));
      setTargetGap(formatInputNumber(targetGapValue / IN_TO_CM, 2));
      setFenceHeight(formatInputNumber(fenceHeightValue / IN_TO_CM, 1));
      setStockLength(formatInputNumber(stockLengthValue / FT_TO_M, 2));
    }

    setUnitMode(nextMode);
  }

  function applyPreset(preset: "privacy" | "spaced" | "horizontal") {
    setUnitMode("imperial");
    setRunLength("48");
    setGateCount("1");
    setGateWidth("4");
    setMaxPostSpacing("8");
    setPostWidth("3.5");
    setStockLength("8");
    setWastePercent("10");

    if (preset === "privacy") {
      setLayoutMode("vertical");
      setPicketWidth("5.5");
      setTargetGap("0.25");
      setFenceHeight("72");
      setRailsPerBay("2");
    }

    if (preset === "spaced") {
      setLayoutMode("vertical");
      setPicketWidth("3.5");
      setTargetGap("2.5");
      setFenceHeight("48");
      setRailsPerBay("2");
    }

    if (preset === "horizontal") {
      setLayoutMode("horizontal");
      setPicketWidth("5.5");
      setTargetGap("0.5");
      setFenceHeight("72");
      setRailsPerBay("2");
    }
  }

  function getSummaryText() {
    if (calculation.errors.length > 0) {
      return t("summary_unavailable");
    }

    const lines = [
      t("summary_title"),
      t("summary_run", {
        net: formatLargeLength(calculation.netRunIn, unitMode),
        total: formatLargeLength(calculation.totalRunIn, unitMode),
      }),
      t("summary_posts", {
        bays: calculation.bayCount,
        posts: calculation.totalPosts,
        spacing: formatLargeLength(calculation.baySpanIn, unitMode),
      }),
      t("summary_gap", {
        gap: formatSmallLength(calculation.actualGapIn, unitMode),
        pieces: calculation.piecesPerBay,
        piece: calculation.pieceLabel,
      }),
      "",
      t("materials.title"),
      ...materialRows.map((row) => `${row.item}: ${row.qty} - ${row.note}`),
    ];

    return lines.join("\n");
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(getSummaryText());
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  function printShoppingList() {
    const rows = materialRows
      .map(
        (row) =>
          `<tr><td>${escapeHtml(row.item)}</td><td>${escapeHtml(
            row.qty
          )}</td><td>${escapeHtml(row.note)}</td></tr>`
      )
      .join("");
    const printWindow = window.open("", "_blank", "width=960,height=720");

    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`<!doctype html>
<html>
<head>
  <title>${escapeHtml(t("print_title"))}</title>
  <style>
    body { color: #111827; font-family: Arial, sans-serif; margin: 24px; }
    h1 { font-size: 22px; margin: 0 0 8px; }
    .summary { color: #4b5563; font-size: 13px; line-height: 1.5; margin-bottom: 18px; white-space: pre-line; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #9ca3af; font-size: 13px; padding: 10px; text-align: left; vertical-align: top; }
    th { background: #f3f4f6; }
  </style>
</head>
<body>
  <h1>${escapeHtml(t("print_title"))}</h1>
  <div class="summary">${escapeHtml(getSummaryText())}</div>
  <table>
    <thead><tr><th>${escapeHtml(t("materials.item"))}</th><th>${escapeHtml(
      t("materials.qty")
    )}</th><th>${escapeHtml(t("materials.note"))}</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => printWindow.print(), 100);
  }

  const previewBayCount = Math.min(calculation.bayCount, MAX_PREVIEW_BAYS);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 max-w-3xl">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,540px)_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
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
              <div className="mb-2 text-sm font-medium">{t("mode_label")}</div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant={layoutMode === "vertical" ? "default" : "outline"}
                  onClick={() => setLayoutMode("vertical")}
                >
                  {t("vertical_mode")}
                </Button>
                <Button
                  type="button"
                  variant={layoutMode === "horizontal" ? "default" : "outline"}
                  onClick={() => setLayoutMode("horizontal")}
                >
                  {t("horizontal_mode")}
                </Button>
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium">{t("presets")}</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyPreset("privacy")}
                >
                  {t("preset_privacy")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyPreset("spaced")}
                >
                  {t("preset_spaced")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyPreset("horizontal")}
                >
                  {t("preset_horizontal")}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  {t("run_length_label", { unit: largeUnit })}
                </span>
                <Input
                  type="number"
                  min="0"
                  value={runLength}
                  onChange={(event) => setRunLength(event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  {t("max_post_spacing_label", { unit: largeUnit })}
                </span>
                <Input
                  type="number"
                  min="0"
                  value={maxPostSpacing}
                  onChange={(event) => setMaxPostSpacing(event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  {t("gate_count_label")}
                </span>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={gateCount}
                  onChange={(event) => setGateCount(event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  {t("gate_width_label", { unit: largeUnit })}
                </span>
                <Input
                  type="number"
                  min="0"
                  value={gateWidth}
                  onChange={(event) => setGateWidth(event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  {t("post_width_label", { unit: smallUnit })}
                </span>
                <Input
                  type="number"
                  min="0"
                  value={postWidth}
                  onChange={(event) => setPostWidth(event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  {layoutMode === "vertical"
                    ? t("picket_width_label", { unit: smallUnit })
                    : t("slat_height_label", { unit: smallUnit })}
                </span>
                <Input
                  type="number"
                  min="0"
                  value={picketWidth}
                  onChange={(event) => setPicketWidth(event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  {t("target_gap_label", { unit: smallUnit })}
                </span>
                <Input
                  type="number"
                  min="0"
                  value={targetGap}
                  onChange={(event) => setTargetGap(event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  {t("fence_height_label", { unit: smallUnit })}
                </span>
                <Input
                  type="number"
                  min="0"
                  value={fenceHeight}
                  onChange={(event) => setFenceHeight(event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  {t("stock_length_label", { unit: largeUnit })}
                </span>
                <Input
                  type="number"
                  min="0"
                  value={stockLength}
                  onChange={(event) => setStockLength(event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  {t("waste_label")}
                </span>
                <Input
                  type="number"
                  min="0"
                  value={wastePercent}
                  onChange={(event) => setWastePercent(event.target.value)}
                />
              </label>
              {layoutMode === "vertical" && (
                <label className="space-y-2 sm:col-span-2">
                  <span className="text-sm font-medium">
                    {t("rails_per_bay_label")}
                  </span>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={railsPerBay}
                    onChange={(event) => setRailsPerBay(event.target.value)}
                  />
                </label>
              )}
            </div>

            <Alert>
              <ListChecks className="size-4" />
              <AlertTitle>{t("local_title")}</AlertTitle>
              <AlertDescription>{t("local_text")}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-primary/25">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Fence className="size-5" />
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
                  <TriangleAlert className="size-4" />
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
                    <Grid2X2 className="size-4" />
                    {t("bay_count")}
                  </div>
                  <div className="mt-2 text-4xl font-bold">
                    {calculation.bayCount}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("bay_spacing_detail", {
                      spacing: formatLargeLength(
                        calculation.baySpanIn,
                        unitMode
                      ),
                    })}
                  </p>
                </div>

                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Ruler className="size-4" />
                    {t("exact_gap")}
                  </div>
                  <div className="mt-2 text-4xl font-bold">
                    {calculation.errors.length > 0
                      ? "-"
                      : formatSmallLength(calculation.actualGapIn, unitMode)}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("pieces_per_bay", {
                      count: calculation.piecesPerBay,
                      piece: calculation.pieceLabel,
                    })}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <div className="text-xs text-muted-foreground">
                    {t("net_fence_length")}
                  </div>
                  <div className="mt-1 text-xl font-semibold">
                    {formatLargeLength(calculation.netRunIn, unitMode)}
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-xs text-muted-foreground">
                    {t("bay_opening")}
                  </div>
                  <div className="mt-1 text-xl font-semibold">
                    {formatLargeLength(calculation.bayOpeningIn, unitMode)}
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-xs text-muted-foreground">
                    {t("total_posts")}
                  </div>
                  <div className="mt-1 text-xl font-semibold">
                    {calculation.totalPosts}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hammer className="size-5" />
                {t("materials.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-hidden rounded-lg border">
                <div className="grid min-w-[640px] grid-cols-[1fr_110px_2fr] bg-muted px-4 py-3 text-sm font-medium">
                  <div>{t("materials.item")}</div>
                  <div>{t("materials.qty")}</div>
                  <div>{t("materials.note")}</div>
                </div>
                <div className="overflow-x-auto">
                  {materialRows.length === 0 ? (
                    <div className="px-4 py-4 text-sm text-muted-foreground">
                      {t("materials.empty")}
                    </div>
                  ) : (
                    materialRows.map((row) => (
                      <div
                        key={row.item}
                        className="grid min-w-[640px] grid-cols-[1fr_110px_2fr] border-t px-4 py-3 text-sm"
                      >
                        <div className="font-medium">{row.item}</div>
                        <div className="text-muted-foreground">{row.qty}</div>
                        <div className="text-muted-foreground">{row.note}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={printShoppingList}
                  disabled={materialRows.length === 0}
                >
                  <Printer className="size-4" />
                  {t("print")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={copySummary}
                  disabled={materialRows.length === 0}
                >
                  <Clipboard className="size-4" />
                  {copyStatus === "copied"
                    ? t("copied")
                    : copyStatus === "failed"
                      ? t("copy_failed")
                      : t("copy")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="mt-10">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-xl">{t("visual_title")}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {t("mode_badge", {
                    mode:
                      layoutMode === "vertical"
                        ? t("vertical_mode")
                        : t("horizontal_mode"),
                  })}
                </Badge>
                <Badge variant="outline">
                  {t("gate_badge", {
                    width: formatLargeLength(calculation.gateTotalIn, unitMode),
                  })}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border bg-muted/20 p-4">
              <div className="flex min-w-[760px] items-end gap-1">
                {Array.from({ length: previewBayCount }, (_, bayIndex) => (
                  <div key={bayIndex} className="flex min-w-[120px] flex-1">
                    <div className="w-3 rounded-t bg-slate-700" />
                    <div className="flex min-h-44 flex-1 items-stretch border-y border-slate-300 bg-background p-2">
                      {layoutMode === "vertical" ? (
                        <div className="flex w-full items-stretch justify-around gap-1">
                          {Array.from(
                            {
                              length: Math.min(
                                calculation.piecesPerBay || 0,
                                16
                              ),
                            },
                            (_, index) => (
                              <div
                                key={index}
                                className="h-full min-w-2 flex-1 rounded-sm bg-amber-700/80"
                              />
                            )
                          )}
                        </div>
                      ) : (
                        <div className="flex h-full w-full flex-col justify-around gap-1">
                          {Array.from(
                            {
                              length: Math.min(
                                calculation.piecesPerBay || 0,
                                9
                              ),
                            },
                            (_, index) => (
                              <div
                                key={index}
                                className="min-h-3 flex-1 rounded-sm bg-amber-700/80"
                              />
                            )
                          )}
                        </div>
                      )}
                    </div>
                    {bayIndex === previewBayCount - 1 && (
                      <div className="w-3 rounded-t bg-slate-700" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {calculation.bayCount > MAX_PREVIEW_BAYS
                ? t("visual_caption_more", {
                    shown: previewBayCount,
                    total: calculation.bayCount,
                    opening: formatLargeLength(
                      calculation.bayOpeningIn,
                      unitMode
                    ),
                    gap: formatSmallLength(calculation.actualGapIn, unitMode),
                  })
                : t("visual_caption", {
                    opening: formatLargeLength(
                      calculation.bayOpeningIn,
                      unitMode
                    ),
                    gap: formatSmallLength(calculation.actualGapIn, unitMode),
                  })}
            </p>
          </CardContent>
        </Card>
      </section>

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
          <h2 className="text-2xl font-bold">{t("planning_guide.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("planning_guide.description")}
          </p>
        </div>
        <div className="mt-6 overflow-hidden rounded-lg border">
          <div className="grid min-w-[760px] grid-cols-[1fr_1fr_2fr] bg-muted px-4 py-3 text-sm font-medium">
            <div>{t("planning_guide.item")}</div>
            <div>{t("planning_guide.value")}</div>
            <div>{t("planning_guide.note")}</div>
          </div>
          <div className="overflow-x-auto">
            {guideRows.map((row) => (
              <div
                key={row.item}
                className="grid min-w-[760px] grid-cols-[1fr_1fr_2fr] border-t px-4 py-3 text-sm"
              >
                <div className="font-medium">{row.item}</div>
                <div className="text-muted-foreground">{row.value}</div>
                <div className="text-muted-foreground">{row.note}</div>
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
