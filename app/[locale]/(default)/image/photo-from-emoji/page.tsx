"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Download,
  ImageDown,
  Loader2,
  RefreshCcw,
  SmilePlus,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface TextBlock {
  title: string;
  description: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface EmojiColor {
  emoji: string;
  color: [number, number, number];
}

interface MosaicResult {
  dataUrl: string;
  emojiText: string;
  columns: number;
  rows: number;
  emojiCount: number;
  skippedCount: number;
}

const DEFAULT_EMOJI_SET =
  "⚫️⚪️🔴🟠🟡🟢🔵🟣🟤❤️🧡💛💚💙💜🖤🤍🤎" +
  "😀😃😄😁🙂😊☺️😌😍🥰😇🤠😎😐😶😳😴" +
  "👶🏻👶🏼👶🏽👶🏾👶🏿👦🏻👦🏼👦🏽👦🏾👦🏿👩🏻👩🏼👩🏽👩🏾👩🏿" +
  "✋🏻✋🏼✋🏽✋🏾✋🏿👍🏻👍🏼👍🏽👍🏾👍🏿" +
  "🌕🌖🌗🌘🌑🌒🌓🌔⭐️✨☀️🌙☁️🌫️💧🌊" +
  "🌹🌺🌸🌷🌼🌻🌿🍀🌲🌳🍃🍂🍁" +
  "🍎🍓🍒🍉🍊🍑🥭🍋🍌🍐🍏🥝🫐🍇🍆🍫☕️🥐🥖" +
  "🟥🟧🟨🟩🟦🟪🟫⬛️⬜️🔶🔷🔸🔹◼️◻️";
const MIN_COLUMNS = 16;
const MAX_COLUMNS = 160;
const MAX_SOURCE_SIZE = 1600;
const SKIP_SYMBOL = "　";

const colorHints: Record<string, [number, number, number]> = {
  "⚫": [28, 28, 30],
  "⚪": [242, 242, 238],
  "🔴": [220, 46, 46],
  "🟠": [236, 126, 45],
  "🟡": [242, 207, 62],
  "🟢": [78, 175, 89],
  "🔵": [70, 122, 218],
  "🟣": [137, 83, 180],
  "🟤": [123, 83, 54],
  "❤️": [218, 48, 66],
  "🧡": [232, 117, 42],
  "💛": [239, 198, 59],
  "💚": [58, 174, 97],
  "💙": [55, 124, 219],
  "💜": [139, 90, 196],
  "🖤": [30, 30, 34],
  "🤍": [244, 244, 238],
  "🤎": [118, 78, 55],
  "😀": [242, 182, 92],
  "😃": [242, 184, 82],
  "😄": [240, 181, 72],
  "😁": [238, 176, 70],
  "🙂": [241, 188, 98],
  "😊": [239, 179, 92],
  "☺": [236, 171, 88],
  "😌": [231, 170, 95],
  "😍": [232, 162, 92],
  "🥰": [230, 160, 96],
  "😇": [242, 194, 118],
  "🤠": [197, 140, 78],
  "😎": [181, 140, 80],
  "😐": [226, 174, 102],
  "😶": [224, 174, 106],
  "😳": [228, 145, 116],
  "😴": [202, 166, 124],
  "👶🏻": [242, 206, 178],
  "👶🏼": [224, 180, 135],
  "👶🏽": [185, 127, 84],
  "👶🏾": [140, 86, 55],
  "👶🏿": [83, 55, 39],
  "👦🏻": [232, 194, 160],
  "👦🏼": [214, 164, 116],
  "👦🏽": [174, 114, 76],
  "👦🏾": [124, 76, 52],
  "👦🏿": [70, 48, 37],
  "👩🏻": [232, 190, 158],
  "👩🏼": [210, 158, 110],
  "👩🏽": [168, 108, 72],
  "👩🏾": [118, 72, 50],
  "👩🏿": [68, 46, 36],
  "✋🏻": [241, 203, 176],
  "✋🏼": [221, 176, 132],
  "✋🏽": [181, 122, 82],
  "✋🏾": [134, 83, 55],
  "✋🏿": [78, 52, 38],
  "👍🏻": [238, 199, 170],
  "👍🏼": [219, 172, 128],
  "👍🏽": [180, 120, 80],
  "👍🏾": [132, 82, 55],
  "👍🏿": [77, 51, 38],
  "🌕": [232, 213, 142],
  "🌖": [174, 160, 110],
  "🌗": [112, 111, 105],
  "🌘": [58, 60, 70],
  "🌑": [29, 31, 40],
  "🌒": [66, 69, 76],
  "🌓": [118, 119, 110],
  "🌔": [190, 175, 118],
  "⭐": [239, 203, 77],
  "✨": [241, 215, 126],
  "☀": [236, 177, 55],
  "🌙": [228, 203, 120],
  "🌫": [181, 190, 197],
  "💧": [86, 161, 222],
  "🌹": [184, 48, 70],
  "🌺": [216, 83, 112],
  "🌸": [236, 160, 184],
  "🌷": [222, 95, 126],
  "🌼": [230, 205, 78],
  "🌻": [217, 164, 48],
  "🌿": [72, 144, 77],
  "🍀": [73, 168, 75],
  "🌲": [45, 112, 68],
  "🌳": [67, 128, 71],
  "🍃": [104, 169, 86],
  "🍂": [190, 122, 58],
  "🍁": [191, 78, 45],
  "🌊": [46, 141, 190],
  "🍎": [199, 50, 48],
  "🍓": [210, 54, 70],
  "🍒": [176, 39, 54],
  "🍉": [218, 80, 86],
  "🍊": [239, 137, 43],
  "🍑": [230, 147, 102],
  "🥭": [224, 145, 55],
  "🍋": [240, 217, 75],
  "🍌": [232, 204, 85],
  "🍐": [170, 187, 78],
  "🍏": [110, 176, 73],
  "🥝": [107, 138, 60],
  "🫐": [74, 92, 165],
  "🍇": [115, 74, 166],
  "🍆": [100, 72, 142],
  "🍫": [96, 57, 42],
  "☕": [110, 75, 55],
  "🥐": [198, 132, 63],
  "🥖": [206, 158, 92],
  "☁️": [232, 235, 240],
  "🟥": [205, 48, 49],
  "🟧": [231, 122, 41],
  "🟨": [235, 202, 54],
  "🟩": [70, 164, 80],
  "🟦": [62, 123, 204],
  "🟪": [129, 76, 166],
  "🟫": [113, 73, 51],
  "⬛": [24, 25, 28],
  "⬜": [236, 236, 232],
  "🔶": [229, 132, 43],
  "🔷": [62, 134, 205],
  "🔸": [230, 136, 44],
  "🔹": [77, 146, 214],
  "◼": [28, 29, 32],
  "◻": [230, 231, 228],
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

function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to load image"));
    };
    image.src = url;
  });
}

function splitEmoji(value: string) {
  return Array.from(
    new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(value),
    (segment) => segment.segment
  ).filter((item) => item.trim().length > 0);
}

function normalizeEmojiKey(emoji: string) {
  return emoji.replace(/\uFE0F/g, "");
}

function hashEmojiColor(emoji: string): [number, number, number] {
  let hash = 0;

  for (const char of emoji) {
    hash = (hash * 31 + char.codePointAt(0)!) >>> 0;
  }

  return [
    60 + (hash % 170),
    60 + ((hash >> 8) % 170),
    60 + ((hash >> 16) % 170),
  ];
}

function buildEmojiPalette(emojiSet: string): EmojiColor[] {
  const seen = new Set<string>();

  return splitEmoji(emojiSet)
    .map((emoji) => {
      const key = normalizeEmojiKey(emoji);

      if (seen.has(key)) {
        return null;
      }

      seen.add(key);

      return {
        emoji,
        color: colorHints[emoji] ?? colorHints[key] ?? hashEmojiColor(emoji),
      };
    })
    .filter(Boolean) as EmojiColor[];
}

function distance(
  [r1, g1, b1]: [number, number, number],
  [r2, g2, b2]: [number, number, number]
) {
  return (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2;
}

function nearestEmoji(
  color: [number, number, number],
  palette: EmojiColor[]
) {
  let best = palette[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const item of palette) {
    const nextDistance = distance(color, item.color);

    if (nextDistance < bestDistance) {
      best = item;
      bestDistance = nextDistance;
    }
  }

  return best.emoji;
}

function rgbToHex([r, g, b]: [number, number, number]) {
  return `#${[r, g, b]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
}

function isNearWhite([r, g, b]: [number, number, number], threshold: number) {
  return r >= threshold && g >= threshold && b >= threshold;
}

async function createEmojiMosaic({
  file,
  columns,
  cellSize,
  emojiSet,
  backgroundColor,
  preserveColor,
  skipLightBackground,
}: {
  file: File;
  columns: number;
  cellSize: number;
  emojiSet: string;
  backgroundColor: string;
  preserveColor: boolean;
  skipLightBackground: boolean;
}): Promise<MosaicResult> {
  const image = await loadImage(file);
  const palette = buildEmojiPalette(emojiSet);

  if (palette.length < 2) {
    throw new Error("Need at least two emoji");
  }

  const scale = Math.min(
    1,
    MAX_SOURCE_SIZE / Math.max(image.naturalWidth, image.naturalHeight)
  );
  const sourceWidth = Math.max(1, Math.round(image.naturalWidth * scale));
  const sourceHeight = Math.max(1, Math.round(image.naturalHeight * scale));
  const rows = Math.max(1, Math.round(columns * (sourceHeight / sourceWidth)));
  const sampleCanvas = document.createElement("canvas");
  const sampleContext = sampleCanvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!sampleContext) {
    throw new Error("Canvas is not supported");
  }

  sampleCanvas.width = columns;
  sampleCanvas.height = rows;
  sampleContext.drawImage(image, 0, 0, columns, rows);

  const imageData = sampleContext.getImageData(0, 0, columns, rows).data;
  const outputCanvas = document.createElement("canvas");
  const outputContext = outputCanvas.getContext("2d");

  if (!outputContext) {
    throw new Error("Canvas is not supported");
  }

  outputCanvas.width = columns * cellSize;
  outputCanvas.height = rows * cellSize;
  outputContext.fillStyle = backgroundColor;
  outputContext.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
  outputContext.textAlign = "center";
  outputContext.textBaseline = "middle";
  outputContext.font = `${Math.round(cellSize * 0.74)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;

  const lines: string[] = [];
  let skippedCount = 0;

  for (let y = 0; y < rows; y++) {
    const line: string[] = [];

    for (let x = 0; x < columns; x++) {
      const index = (y * columns + x) * 4;
      const alpha = imageData[index + 3] / 255;
      const color: [number, number, number] = [
        Math.round(imageData[index] * alpha + 255 * (1 - alpha)),
        Math.round(imageData[index + 1] * alpha + 255 * (1 - alpha)),
        Math.round(imageData[index + 2] * alpha + 255 * (1 - alpha)),
      ];

      if (skipLightBackground && isNearWhite(color, 242)) {
        skippedCount += 1;
        line.push(SKIP_SYMBOL);
        continue;
      }

      const emoji = nearestEmoji(color, palette);

      line.push(emoji);

      if (preserveColor) {
        outputContext.fillStyle = rgbToHex(color);
        outputContext.fillRect(
          x * cellSize,
          y * cellSize,
          cellSize + 0.5,
          cellSize + 0.5
        );
        outputContext.fillStyle =
          color[0] * 0.299 + color[1] * 0.587 + color[2] * 0.114 > 140
            ? "rgba(0, 0, 0, 0.34)"
            : "rgba(255, 255, 255, 0.42)";
      }

      outputContext.fillText(
        emoji,
        x * cellSize + cellSize / 2,
        y * cellSize + cellSize / 2
      );
    }

    lines.push(line.join(""));
  }

  return {
    columns,
    rows,
    emojiCount: columns * rows,
    skippedCount,
    emojiText: lines.join("\n"),
    dataUrl: outputCanvas.toDataURL("image/png"),
  };
}

export default function PhotoFromEmojiPage() {
  const t = useTranslations("tools.categories.image.tools.photo_from_emoji");
  const useCases = asList<TextBlock>(t.raw("use_cases.items"));
  const tips = asList<TextBlock>(t.raw("tips.items"));
  const faqs = asList<FaqItem>(t.raw("faq.items"));
  const downloadRef = useRef<HTMLAnchorElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [columns, setColumns] = useState(48);
  const [cellSize, setCellSize] = useState(10);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [emojiSet, setEmojiSet] = useState(DEFAULT_EMOJI_SET);
  const [preserveColor, setPreserveColor] = useState(true);
  const [skipLightBackground, setSkipLightBackground] = useState(true);
  const [result, setResult] = useState<MosaicResult | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: t("title"),
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any",
      url: "https://www.tinytoolflare.com/image/photo-from-emoji",
      description: t("page_description"),
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "photo from emoji",
        "emoji mosaic generator",
        "image to emoji art",
        "download emoji PNG",
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

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];

    if (!nextFile) {
      return;
    }

    if (!nextFile.type.startsWith("image/")) {
      toast.error(t("invalid_file"));
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    setResult(null);
  }

  async function handleGenerate() {
    if (!file) {
      toast.error(t("upload_required"));
      return;
    }

    setProcessing(true);

    try {
      const nextResult = await createEmojiMosaic({
        file,
        columns,
        cellSize,
        emojiSet,
        backgroundColor,
        preserveColor,
        skipLightBackground,
      });

      setResult(nextResult);
      toast.success(t("success"));
    } catch (error) {
      toast.error(t("error"));
    } finally {
      setProcessing(false);
    }
  }

  async function copyEmojiText() {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(result.emojiText);
    toast.success(t("copied"));
  }

  function downloadPng() {
    if (!result || !downloadRef.current) {
      return;
    }

    downloadRef.current.href = result.dataUrl;
    downloadRef.current.download = "photo-from-emoji.png";
    downloadRef.current.click();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <a ref={downloadRef} className="hidden" aria-hidden="true" />

      <div className="mb-6 max-w-3xl">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,520px)_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <SmilePlus className="size-5" />
              {t("tool_title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <label className="block cursor-pointer rounded-lg border border-dashed p-5 text-center transition-colors hover:border-primary">
              <Upload className="mx-auto size-8 text-muted-foreground" />
              <span className="mt-3 block text-sm font-medium">
                {t("upload_label")}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {t("upload_hint")}
              </span>
              <Input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">{t("columns")}</span>
                <Input
                  type="number"
                  min={MIN_COLUMNS}
                  max={MAX_COLUMNS}
                  value={columns}
                  onChange={(event) =>
                    setColumns(
                      Math.min(
                        MAX_COLUMNS,
                        Math.max(MIN_COLUMNS, Number(event.target.value) || 48)
                      )
                    )
                  }
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium">{t("cell_size")}</span>
                <Input
                  type="number"
                  min="6"
                  max="42"
                  value={cellSize}
                  onChange={(event) =>
                    setCellSize(
                      Math.min(42, Math.max(6, Number(event.target.value) || 10))
                    )
                  }
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium">{t("background")}</span>
              <Input
                type="color"
                value={backgroundColor}
                onChange={(event) => setBackgroundColor(event.target.value)}
                className="h-11"
              />
            </label>

            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">
                    {t("preserve_color")}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {t("preserve_color_hint")}
                  </p>
                </div>
                <Switch
                  checked={preserveColor}
                  onCheckedChange={setPreserveColor}
                  aria-label={t("preserve_color")}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">
                    {t("skip_background")}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {t("skip_background_hint")}
                  </p>
                </div>
                <Switch
                  checked={skipLightBackground}
                  onCheckedChange={setSkipLightBackground}
                  aria-label={t("skip_background")}
                />
              </div>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium">{t("emoji_set")}</span>
              <Textarea
                value={emojiSet}
                onChange={(event) => setEmojiSet(event.target.value)}
                className="min-h-24 text-lg leading-relaxed"
              />
              <span className="block text-xs text-muted-foreground">
                {t("emoji_set_hint")}
              </span>
            </label>

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={handleGenerate} disabled={processing}>
                {processing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ImageDown className="size-4" />
                )}
                {processing ? t("generating") : t("generate")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setColumns(48);
                  setCellSize(10);
                  setBackgroundColor("#ffffff");
                  setEmojiSet(DEFAULT_EMOJI_SET);
                  setPreserveColor(true);
                  setSkipLightBackground(true);
                  setResult(null);
                }}
              >
                <RefreshCcw className="size-4" />
                {t("reset")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t("preview_title")}</CardTitle>
            </CardHeader>
            <CardContent>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={t("preview_title")}
                  className="max-h-[360px] w-full rounded-lg border object-contain"
                />
              ) : (
                <div className="flex min-h-[260px] items-center justify-center rounded-lg border bg-muted/30 text-sm text-muted-foreground">
                  {t("empty_preview")}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-xl">{t("result_title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {result ? (
                <>
                  <img
                    src={result.dataUrl}
                    alt={t("result_title")}
                    className="w-full rounded-lg border bg-white object-contain"
                  />
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">
                        {t("output_grid")}
                      </div>
                      <div className="mt-1 text-lg font-semibold">
                        {result.columns} x {result.rows}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">
                        {t("emoji_count")}
                      </div>
                      <div className="mt-1 text-lg font-semibold">
                        {result.emojiCount}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">
                        {t("palette_count")}
                      </div>
                      <div className="mt-1 text-lg font-semibold">
                        {buildEmojiPalette(emojiSet).length}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">
                        {t("skipped_count")}
                      </div>
                      <div className="mt-1 text-lg font-semibold">
                        {result.skippedCount}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={downloadPng}>
                      <Download className="size-4" />
                      {t("download")}
                    </Button>
                    <Button type="button" variant="outline" onClick={copyEmojiText}>
                      {t("copy_text")}
                    </Button>
                  </div>
                  <Textarea
                    readOnly
                    value={result.emojiText}
                    className="max-h-56 min-h-32 font-mono text-xs leading-tight"
                  />
                </>
              ) : (
                <div className="flex min-h-[320px] items-center justify-center rounded-lg border bg-muted/30 text-sm text-muted-foreground">
                  {t("empty_result")}
                </div>
              )}
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
          <h2 className="text-2xl font-bold">{t("tips.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("tips.description")}
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {tips.map((item) => (
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
