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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Copy,
  Download,
  Heart,
  MessageCircle,
  Quote,
  RotateCcw,
  Share2,
  Sparkles,
  Star,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type StyleKey =
  | "short_video"
  | "red_note"
  | "story"
  | "quote"
  | "minimal"
  | "thread"
  | "neon"
  | "newspaper"
  | "memo";
type SizeKey = "portrait" | "square" | "story";

interface TextBlock {
  title: string;
  description: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface ContentTemplate {
  key: string;
  label: string;
  text: string;
  highlight: string;
  footer: string;
}

interface StylePreset {
  key: StyleKey;
  bg: string;
  card: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  bgColor: string;
  cardColor: string;
  textColor: string;
  mutedColor: string;
  radius: string;
  shadow: string;
  border?: string;
  borderColor?: string;
  showSocial?: boolean;
}

const styles: StylePreset[] = [
  {
    key: "short_video",
    bg: "bg-emerald-500",
    card: "bg-black",
    text: "text-white",
    muted: "text-zinc-400",
    accent: "#24f4ee",
    accentText: "text-cyan-300",
    bgColor: "#10b981",
    cardColor: "#000000",
    textColor: "#ffffff",
    mutedColor: "#a1a1aa",
    radius: "rounded-[2rem]",
    shadow: "shadow-2xl",
    showSocial: true,
  },
  {
    key: "red_note",
    bg: "bg-[#f7efe7]",
    card: "bg-[#fffaf5]",
    text: "text-[#2c211b]",
    muted: "text-[#8d7669]",
    accent: "#ff2442",
    accentText: "text-[#ff2442]",
    bgColor: "#f7efe7",
    cardColor: "#fffaf5",
    textColor: "#2c211b",
    mutedColor: "#8d7669",
    radius: "rounded-md",
    shadow: "shadow-sm",
    border: "border border-[#ead9cc]",
    borderColor: "#ead9cc",
  },
  {
    key: "story",
    bg: "bg-[linear-gradient(135deg,#fdc830_0%,#f37335_38%,#833ab4_100%)]",
    card: "bg-white/16 backdrop-blur",
    text: "text-white",
    muted: "text-white/70",
    accent: "#ffe66d",
    accentText: "text-yellow-200",
    bgColor: "#f37335",
    cardColor: "rgba(255,255,255,.16)",
    textColor: "#ffffff",
    mutedColor: "rgba(255,255,255,.72)",
    radius: "rounded-2xl",
    shadow: "shadow-2xl",
    border: "border border-white/25",
    borderColor: "rgba(255,255,255,.25)",
  },
  {
    key: "quote",
    bg: "bg-[#e8edf2]",
    card: "bg-white",
    text: "text-[#111827]",
    muted: "text-[#64748b]",
    accent: "#111827",
    accentText: "text-[#111827]",
    bgColor: "#e8edf2",
    cardColor: "#ffffff",
    textColor: "#111827",
    mutedColor: "#64748b",
    radius: "rounded-lg",
    shadow: "shadow-md",
    border: "border border-[#d8dee8]",
    borderColor: "#d8dee8",
  },
  {
    key: "minimal",
    bg: "bg-[#f5f5f0]",
    card: "bg-[#fdfdf8]",
    text: "text-[#202124]",
    muted: "text-[#757575]",
    accent: "#0f766e",
    accentText: "text-teal-700",
    bgColor: "#f5f5f0",
    cardColor: "#fdfdf8",
    textColor: "#202124",
    mutedColor: "#757575",
    radius: "rounded",
    shadow: "shadow-none",
    border: "border border-[#deded4]",
    borderColor: "#deded4",
  },
  {
    key: "thread",
    bg: "bg-[#f2f5f7]",
    card: "bg-white",
    text: "text-[#0f1419]",
    muted: "text-[#536471]",
    accent: "#1d9bf0",
    accentText: "text-[#1d9bf0]",
    bgColor: "#f2f5f7",
    cardColor: "#ffffff",
    textColor: "#0f1419",
    mutedColor: "#536471",
    radius: "rounded-2xl",
    shadow: "shadow-sm",
    border: "border border-[#dbe3ea]",
    borderColor: "#dbe3ea",
  },
  {
    key: "neon",
    bg: "bg-[#111827]",
    card: "bg-[#121212]",
    text: "text-[#f8fafc]",
    muted: "text-[#a3a3a3]",
    accent: "#a3ff12",
    accentText: "text-[#a3ff12]",
    bgColor: "#111827",
    cardColor: "#121212",
    textColor: "#f8fafc",
    mutedColor: "#a3a3a3",
    radius: "rounded-xl",
    shadow: "shadow-2xl",
    border: "border border-[#a3ff12]/40",
    borderColor: "rgba(163,255,18,.4)",
  },
  {
    key: "newspaper",
    bg: "bg-[#d8d1c3]",
    card: "bg-[#fffdf5]",
    text: "text-[#15110d]",
    muted: "text-[#6f675a]",
    accent: "#b42318",
    accentText: "text-[#b42318]",
    bgColor: "#d8d1c3",
    cardColor: "#fffdf5",
    textColor: "#15110d",
    mutedColor: "#6f675a",
    radius: "rounded",
    shadow: "shadow-sm",
    border: "border border-[#b8ad9a]",
    borderColor: "#b8ad9a",
  },
  {
    key: "memo",
    bg: "bg-[#e9f2ff]",
    card: "bg-[#fff9c7]",
    text: "text-[#2b2615]",
    muted: "text-[#756c46]",
    accent: "#2563eb",
    accentText: "text-[#2563eb]",
    bgColor: "#e9f2ff",
    cardColor: "#fff9c7",
    textColor: "#2b2615",
    mutedColor: "#756c46",
    radius: "rounded-md",
    shadow: "shadow-md",
    border: "border border-[#eadf8f]",
    borderColor: "#eadf8f",
  },
];

const sizes = {
  portrait: { width: 900, height: 1200, ratio: "aspect-[3/4]" },
  square: { width: 1080, height: 1080, ratio: "aspect-square" },
  story: { width: 1080, height: 1920, ratio: "aspect-[9/16]" },
} as const;

function asList<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value && typeof value === "object") {
    return Object.values(value) as T[];
  }

  return [];
}

function isHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}

function getStyleColors(
  preset: StylePreset,
  customColors: {
    background: string;
    card: string;
    text: string;
    accent: string;
  }
) {
  return {
    background: isHexColor(customColors.background)
      ? customColors.background
      : preset.bgColor,
    card: isHexColor(customColors.card) ? customColors.card : preset.cardColor,
    text: isHexColor(customColors.text) ? customColors.text : preset.textColor,
    muted: preset.mutedColor,
    accent: isHexColor(customColors.accent)
      ? customColors.accent
      : preset.accent,
  };
}

function splitHighlight(text: string, words: string[]) {
  const targets = words.map((word) => word.trim()).filter(Boolean);

  if (targets.length === 0) {
    return [{ text, highlight: false }];
  }

  const escaped = targets.map((word) =>
    word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");

  return text.split(regex).filter(Boolean).map((part) => ({
    text: part,
    highlight: targets.some(
      (word) => word.toLocaleLowerCase() === part.toLocaleLowerCase()
    ),
  }));
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
  const lines: string[] = [];

  text.split("\n").forEach((paragraph) => {
    let line = "";
    const tokens = paragraph.includes(" ")
      ? paragraph.split(/(\s+)/)
      : Array.from(paragraph);

    tokens.forEach((token) => {
      const testLine = `${line}${token}`;
      if (context.measureText(testLine).width > maxWidth && line) {
        lines.push(line.trimEnd());
        line = token.trimStart();
      } else {
        line = testLine;
      }
    });

    lines.push(line);
  });

  return lines;
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function drawHeart(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  context.save();
  context.translate(x, y);
  context.scale(size / 32, size / 32);
  context.beginPath();
  context.moveTo(0, 9);
  context.bezierCurveTo(0, 2, -10, 0, -14, 7);
  context.bezierCurveTo(-19, 16, -6, 23, 0, 29);
  context.bezierCurveTo(6, 23, 19, 16, 14, 7);
  context.bezierCurveTo(10, 0, 0, 2, 0, 9);
  context.closePath();
  context.fill();
  context.restore();
}

function drawComment(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  roundedRect(context, x - width / 2, y - height / 2, width, height, height / 2);
  context.fill();
  context.beginPath();
  context.moveTo(x - width * 0.18, y + height * 0.3);
  context.lineTo(x - width * 0.32, y + height * 0.56);
  context.lineTo(x + width * 0.04, y + height * 0.34);
  context.closePath();
  context.fill();
}

function drawStar(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
) {
  context.beginPath();

  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const pointRadius = i % 2 === 0 ? radius : radius * 0.45;
    const pointX = x + Math.cos(angle) * pointRadius;
    const pointY = y + Math.sin(angle) * pointRadius;

    if (i === 0) {
      context.moveTo(pointX, pointY);
    } else {
      context.lineTo(pointX, pointY);
    }
  }

  context.closePath();
  context.fill();
}

function renderTextCardCanvas({
  style,
  size,
  text,
  highlightWords,
  author,
  handle,
  date,
  footer,
  fontSize,
  customColors,
}: {
  style: StyleKey;
  size: SizeKey;
  text: string;
  highlightWords: string[];
  author: string;
  handle: string;
  date: string;
  footer: string;
  fontSize: number;
  customColors: {
    background: string;
    card: string;
    text: string;
    accent: string;
  };
}) {
  const preset = styles.find((item) => item.key === style) ?? styles[0];
  const colors = getStyleColors(preset, customColors);
  const output = sizes[size];
  const canvas = document.createElement("canvas");
  const scale = window.devicePixelRatio || 2;
  canvas.width = output.width * scale;
  canvas.height = output.height * scale;
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  context.scale(scale, scale);
  let background: string | CanvasGradient = colors.background;

  if (style === "story" && colors.background === preset.bgColor) {
    const gradient = context.createLinearGradient(0, 0, output.width, output.height);
    gradient.addColorStop(0, "#fdc830");
    gradient.addColorStop(0.42, "#f37335");
    gradient.addColorStop(1, "#833ab4");
    background = gradient;
  }

  context.fillStyle = background;
  context.fillRect(0, 0, output.width, output.height);

  const padding = output.width * 0.055;
  const cardX = padding;
  const cardY = padding;
  const cardWidth = output.width - padding * 2;
  const cardHeight = output.height - padding * 2;
  const radius = style === "short_video" ? 70 : style === "minimal" ? 6 : 24;

  context.fillStyle = colors.card;
  roundedRect(context, cardX, cardY, cardWidth, cardHeight, radius);
  context.fill();

  const contentX = cardX + cardWidth * 0.08;
  const socialRailWidth = preset.showSocial ? cardWidth * 0.16 : 0;
  const contentWidth = cardWidth * 0.82 - socialRailWidth;
  const top = cardY + cardHeight * 0.075;
  const textColor = colors.text;
  const mutedColor = colors.muted;

  context.fillStyle = colors.accent;
  context.beginPath();
  context.arc(contentX + 32, top + 32, 32, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = style === "red_note" ? "#fff" : "#111";
  context.font = "700 28px Arial, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(author.slice(0, 1).toUpperCase() || "T", contentX + 32, top + 34);

  context.textAlign = "left";
  context.fillStyle = textColor;
  context.font = "700 28px Arial, sans-serif";
  context.fillText(author, contentX + 82, top + 22);
  context.fillStyle = mutedColor;
  context.font = "600 22px Arial, sans-serif";
  context.fillText(`${handle} · ${date}`, contentX + 82, top + 56);

  const bodyFont = Math.round(fontSize * (output.width / 900));
  context.font = `800 ${bodyFont}px Arial, "PingFang SC", "Microsoft YaHei", sans-serif`;
  context.textBaseline = "top";
  const lines = wrapCanvasText(context, text, contentWidth);
  const lineHeight = bodyFont * 1.28;
  const bodyY = cardY + cardHeight * (style === "story" ? 0.27 : 0.29);
  const targets = highlightWords.map((word) => word.trim()).filter(Boolean);

  lines.slice(0, 9).forEach((line, lineIndex) => {
    let cursorX = contentX;
    const parts = splitHighlight(line, targets);
    parts.forEach((part) => {
      context.fillStyle = part.highlight ? colors.accent : textColor;
      context.fillText(part.text, cursorX, bodyY + lineIndex * lineHeight);
      cursorX += context.measureText(part.text).width;
    });
  });

  context.fillStyle = mutedColor;
  context.font = "700 24px Arial, sans-serif";
  context.fillText(footer, contentX, cardY + cardHeight - 80);

  if (preset.showSocial) {
    const railX = cardX + cardWidth - cardWidth * 0.08;
    const railTop = cardY + cardHeight * 0.4;

    context.fillStyle = "#fff";
    context.beginPath();
    context.arc(railX, railTop, 36, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = colors.accent;
    context.beginPath();
    context.arc(railX, railTop, 30, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#fff";
    context.font = "800 30px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(author.slice(0, 1).toUpperCase() || "T", railX, railTop + 2);
    context.fillStyle = "#f43f5e";
    context.beginPath();
    context.arc(railX + 26, railTop + 32, 19, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#fff";
    context.font = "500 30px Arial, sans-serif";
    context.fillText("+", railX + 26, railTop + 33);

    context.fillStyle = "#fff";
    drawHeart(context, railX, railTop + 120, 48);
    context.fillStyle = textColor;
    context.font = "800 24px Arial, sans-serif";
    context.fillText("82", railX, railTop + 178);

    context.fillStyle = "#fff";
    drawComment(context, railX, railTop + 250, 54, 42);
    context.fillStyle = textColor;
    context.fillText("76", railX, railTop + 306);

    context.fillStyle = "#fff";
    drawStar(context, railX, railTop + 390, 34);
    context.textAlign = "left";
  }

  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Could not create image."));
    }, "image/png");
  });
}

async function createTextCardFile(
  options: Parameters<typeof renderTextCardCanvas>[0]
) {
  const canvas = renderTextCardCanvas(options);

  if (!canvas) {
    throw new Error("Canvas is not supported.");
  }

  const blob = await canvasToBlob(canvas);

  return new File([blob], `text-card-${options.style}.png`, {
    type: "image/png",
  });
}

async function downloadTextCard(
  options: Parameters<typeof renderTextCardCanvas>[0]
) {
  const file = await createTextCardFile(options);
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.download = file.name;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

async function copyTextCard(options: Parameters<typeof renderTextCardCanvas>[0]) {
  const file = await createTextCardFile(options);

  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
    return false;
  }

  await navigator.clipboard.write([
    new ClipboardItem({
      [file.type]: file,
    }),
  ]);

  return true;
}

export default function TextCardGeneratorPage() {
  const t = useTranslations(
    "tools.categories.generator.tools.text_card_generator"
  );
  const useCases = asList<TextBlock>(t.raw("use_cases.items"));
  const faqs = asList<FaqItem>(t.raw("faq.items"));
  const templates = asList<ContentTemplate>(t.raw("templates.items"));
  const [text, setText] = useState(t("defaults.text"));
  const [highlight, setHighlight] = useState(t("defaults.highlight"));
  const [author, setAuthor] = useState(t("defaults.author"));
  const [handle, setHandle] = useState("@tinytoolflare");
  const [date, setDate] = useState("05-31");
  const [footer, setFooter] = useState(t("defaults.footer"));
  const [style, setStyle] = useState<StyleKey>("short_video");
  const [size, setSize] = useState<SizeKey>("portrait");
  const [fontSize, setFontSize] = useState(40);
  const [customColors, setCustomColors] = useState({
    background: styles[0].bgColor,
    card: styles[0].cardColor,
    text: styles[0].textColor,
    accent: styles[0].accent,
  });
  const [status, setStatus] = useState("");
  const preset = styles.find((item) => item.key === style) ?? styles[0];
  const colors = getStyleColors(preset, customColors);
  const output = sizes[size];
  const highlightWords = useMemo(
    () =>
      highlight
        .split(/[,，]/)
        .map((word) => word.trim())
        .filter(Boolean),
    [highlight]
  );
  const parts = splitHighlight(text, highlightWords);
  const renderOptions = {
    style,
    size,
    text,
    highlightWords,
    author,
    handle,
    date,
    footer,
    fontSize,
    customColors,
  };

  function applyStyle(nextStyle: StyleKey) {
    const nextPreset = styles.find((item) => item.key === nextStyle) ?? styles[0];
    setStyle(nextStyle);
    setCustomColors({
      background: nextPreset.bgColor,
      card: nextPreset.cardColor.startsWith("rgba")
        ? nextPreset.bgColor
        : nextPreset.cardColor,
      text: nextPreset.textColor,
      accent: nextPreset.accent,
    });
  }

  function updateCustomColor(
    key: keyof typeof customColors,
    value: string
  ) {
    setCustomColors((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleDownload() {
    try {
      setStatus("");
      await downloadTextCard(renderOptions);
      setStatus(t("download_ready"));
    } catch {
      setStatus(t("image_error"));
    }
  }

  async function handleCopy() {
    try {
      setStatus("");
      const copied = await copyTextCard(renderOptions);

      if (copied) {
        setStatus(t("copied_image"));
        return;
      }

      await downloadTextCard(renderOptions);
      setStatus(t("copy_fallback"));
    } catch {
      setStatus(t("clipboard_error"));
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 max-w-3xl">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="size-5" />
              {t("editor_title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>{t("template_label")}</Label>
              <Select
                onValueChange={(value) => {
                  const template = templates.find((item) => item.key === value);

                  if (!template) {
                    return;
                  }

                  setText(template.text);
                  setHighlight(template.highlight);
                  setFooter(template.footer);
                  setStatus("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("template_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((item) => (
                    <SelectItem key={item.key} value={item.key}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-text">{t("text_label")}</Label>
              <Textarea
                id="card-text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={7}
                className="resize-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("style_label")}</Label>
                <Select
                  value={style}
                  onValueChange={(value) => applyStyle(value as StyleKey)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {styles.map((item) => (
                      <SelectItem key={item.key} value={item.key}>
                        {t(`styles.${item.key}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("size_label")}</Label>
                <Select
                  value={size}
                  onValueChange={(value) => setSize(value as SizeKey)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">{t("sizes.portrait")}</SelectItem>
                    <SelectItem value="square">{t("sizes.square")}</SelectItem>
                    <SelectItem value="story">{t("sizes.story")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border p-3">
              <div className="text-sm font-medium">{t("custom_colors")}</div>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["background", t("color_background")],
                    ["card", t("color_card")],
                    ["text", t("color_text")],
                    ["accent", t("color_accent")],
                  ] as const
                ).map(([key, label]) => (
                  <Label
                    key={key}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span>{label}</span>
                    <Input
                      type="color"
                      value={customColors[key]}
                      onChange={(event) =>
                        updateCustomColor(key, event.target.value)
                      }
                      className="h-9 w-12 cursor-pointer p-1"
                    />
                  </Label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="highlight">{t("highlight_label")}</Label>
              <Input
                id="highlight"
                value={highlight}
                onChange={(event) => setHighlight(event.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="author">{t("author_label")}</Label>
                <Input
                  id="author"
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="handle">{t("handle_label")}</Label>
                <Input
                  id="handle"
                  value={handle}
                  onChange={(event) => setHandle(event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">{t("date_label")}</Label>
                <Input
                  id="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="footer">{t("footer_label")}</Label>
                <Input
                  id="footer"
                  value={footer}
                  onChange={(event) => setFooter(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="font-size">{t("font_size_label")}</Label>
                <span className="text-sm text-muted-foreground">{fontSize}px</span>
              </div>
              <Input
                id="font-size"
                type="range"
                min={20}
                max={82}
                value={fontSize}
                onChange={(event) => setFontSize(Number(event.target.value))}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleDownload}>
                <Download className="mr-2 size-4" />
                {t("download")}
              </Button>
              <Button type="button" variant="secondary" onClick={handleCopy}>
                <Copy className="mr-2 size-4" />
                {t("copy_image")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setText(t("defaults.text"));
                  setHighlight(t("defaults.highlight"));
                  setAuthor(t("defaults.author"));
                  setFooter(t("defaults.footer"));
                  setStatus("");
                }}
              >
                <RotateCcw className="mr-2 size-4" />
                {t("reset")}
              </Button>
            </div>
            {status && (
              <p className="text-sm font-medium text-muted-foreground">
                {status}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>{t("preview_title")}</span>
            <span>
              {output.width} x {output.height}px
            </span>
          </div>
          <div className="flex justify-center overflow-x-auto rounded-lg border bg-muted/40 p-4 sm:p-6">
            <div
              className={cn(
                "relative w-full max-w-[520px] shrink-0 overflow-hidden",
                output.ratio,
                preset.bg
              )}
              style={{
                background:
                  style === "story" && colors.background === preset.bgColor
                    ? "linear-gradient(135deg,#fdc830 0%,#f37335 38%,#833ab4 100%)"
                    : colors.background,
              }}
            >
              <div
                className={cn(
                  "absolute inset-[5.5%] flex flex-col overflow-hidden p-[7%]",
                  preset.card,
                  preset.text,
                  preset.radius,
                  preset.shadow,
                  preset.border
                )}
                style={{
                  backgroundColor: colors.card,
                  borderColor: preset.borderColor,
                  color: colors.text,
                }}
              >
                <div
                  className="flex items-center gap-3"
                  style={{
                    maxWidth: preset.showSocial ? "calc(100% - 5rem)" : undefined,
                  }}
                >
                  <div
                    className="grid size-12 shrink-0 place-items-center rounded-full text-lg font-black text-white"
                    style={{ backgroundColor: colors.accent }}
                  >
                    {author.slice(0, 1).toUpperCase() || "T"}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-base font-bold">{author}</div>
                    <div
                      className="truncate text-sm font-semibold"
                      style={{ color: colors.muted }}
                    >
                      {handle} · {date}
                    </div>
                  </div>
                </div>

                <div
                  className="mt-auto whitespace-pre-wrap break-words font-black leading-tight"
                  style={{
                    fontSize: `clamp(2rem, ${fontSize / 9}vw, ${fontSize}px)`,
                    maxWidth: preset.showSocial
                      ? "calc(100% - 5.25rem)"
                      : undefined,
                  }}
                >
                  {parts.map((part, index) => (
                    <span
                      key={`${part.text}-${index}`}
                      style={{ color: part.highlight ? colors.accent : undefined }}
                    >
                      {part.text}
                    </span>
                  ))}
                </div>

                <div
                  className="mt-auto text-sm font-bold"
                  style={{ color: colors.muted }}
                >
                  {footer}
                </div>

                {preset.showSocial && (
                  <div className="absolute right-[5%] top-[50%] flex -translate-y-1/2 flex-col items-center gap-5">
                    <div className="relative">
                      <div
                        className="grid size-14 place-items-center rounded-full text-lg font-black text-white ring-4 ring-white"
                        style={{ backgroundColor: colors.accent }}
                      >
                        {author.slice(0, 1).toUpperCase() || "T"}
                      </div>
                      <div className="absolute -bottom-2 left-1/2 grid size-7 -translate-x-1/2 place-items-center rounded-full bg-rose-500 text-white">
                        +
                      </div>
                    </div>
                    <div className="text-center text-white">
                      <Heart className="size-9 fill-white" />
                      <div className="mt-1 text-sm font-bold">82</div>
                    </div>
                    <div className="text-center text-white">
                      <MessageCircle className="size-9 fill-white" />
                      <div className="mt-1 text-sm font-bold">76</div>
                    </div>
                    <Star className="size-9 fill-white text-white" />
                  </div>
                )}

                {style === "quote" && (
                  <Quote className="absolute right-8 top-8 size-14 text-slate-200" />
                )}

                {style === "story" && (
                  <Share2 className="absolute bottom-8 right-8 size-7 text-white/75" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{t("style_gallery.title")}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {t("style_gallery.description")}
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {styles.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => applyStyle(item.key)}
              className={cn(
                "overflow-hidden rounded-lg border text-left transition hover:-translate-y-0.5 hover:shadow-md",
                style === item.key ? "ring-2 ring-primary" : ""
              )}
            >
              <div
                className="p-4"
                style={{
                  background:
                    item.key === "story"
                      ? "linear-gradient(135deg,#fdc830 0%,#f37335 38%,#833ab4 100%)"
                      : item.bgColor,
                }}
              >
                <div
                  className={cn("min-h-32 p-4", item.radius, item.border)}
                  style={{
                    backgroundColor: item.cardColor.startsWith("rgba")
                      ? "rgba(255,255,255,.18)"
                      : item.cardColor,
                    borderColor: item.borderColor,
                    color: item.textColor,
                  }}
                >
                  <div className="mb-5 flex items-center gap-2">
                    <span
                      className="grid size-8 place-items-center rounded-full text-sm font-black text-white"
                      style={{ backgroundColor: item.accent }}
                    >
                      T
                    </span>
                    <span className="text-sm font-bold">
                      {t(`styles.${item.key}`)}
                    </span>
                  </div>
                  <div className="text-xl font-black leading-tight">
                    <span>{t("style_gallery.sample_before")}</span>
                    <span style={{ color: item.accent }}>
                      {t("style_gallery.sample_highlight")}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">{t("use_cases.title")}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {t("use_cases.description")}
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
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

      <section className="mt-12">
        <h2 className="text-xl font-bold">{t("faq.title")}</h2>
        <Accordion type="single" collapsible className="mt-4">
          {faqs.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
