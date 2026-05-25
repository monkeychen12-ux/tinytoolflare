"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, ImageDown, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type OutputFormat = "image/jpeg" | "image/webp" | "image/png";

interface CompressionResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  quality: number;
  format: OutputFormat;
}

interface TextBlock {
  title: string;
  description: string;
}

interface PlatformLimit {
  platform: string;
  limit: string;
  note: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

const TARGET_PRESETS = [100, 200, 500, 1024];
const MAX_DIMENSION = 6000;

function asList<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value && typeof value === "object") {
    return Object.values(value) as T[];
  }

  return [];
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getExtension(format: OutputFormat) {
  if (format === "image/png") {
    return "png";
  }

  if (format === "image/webp") {
    return "webp";
  }

  return "jpg";
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

function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: OutputFormat,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Unable to compress image"));
        }
      },
      format,
      format === "image/png" ? undefined : quality
    );
  });
}

function drawToCanvas(
  image: HTMLImageElement,
  scale: number,
  fillWhite: boolean
) {
  const sourceMax = Math.max(image.naturalWidth, image.naturalHeight);
  const safeScale = Math.min(1, MAX_DIMENSION / sourceMax) * scale;
  const width = Math.max(1, Math.round(image.naturalWidth * safeScale));
  const height = Math.max(1, Math.round(image.naturalHeight * safeScale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not supported");
  }

  canvas.width = width;
  canvas.height = height;

  if (fillWhite) {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
  }

  context.drawImage(image, 0, 0, width, height);

  return { canvas, width, height };
}

async function compressToTargetSize({
  file,
  targetBytes,
  format,
}: {
  file: File;
  targetBytes: number;
  format: OutputFormat;
}) {
  const image = await loadImage(file);
  const fillWhite = format === "image/jpeg";
  let best: CompressionResult | null = null;
  let scale = 1;

  for (let scaleAttempt = 0; scaleAttempt < 14; scaleAttempt++) {
    const { canvas, width, height } = drawToCanvas(image, scale, fillWhite);

    if (format === "image/png") {
      const blob = await canvasToBlob(canvas, format, 1);
      best = {
        blob,
        url: "",
        width,
        height,
        quality: 1,
        format,
      };

      if (blob.size <= targetBytes) {
        break;
      }
    } else {
      let low = 0.1;
      let high = 0.95;

      for (let qualityAttempt = 0; qualityAttempt < 8; qualityAttempt++) {
        const quality = (low + high) / 2;
        const blob = await canvasToBlob(canvas, format, quality);
        const candidate = {
          blob,
          url: "",
          width,
          height,
          quality,
          format,
        };

        if (
          !best ||
          (blob.size <= targetBytes && blob.size > best.blob.size) ||
          (best.blob.size > targetBytes && blob.size < best.blob.size)
        ) {
          best = candidate;
        }

        if (blob.size > targetBytes) {
          high = quality;
        } else {
          low = quality;
        }
      }

      if (best && best.blob.size <= targetBytes) {
        break;
      }
    }

    scale *= 0.82;
  }

  if (!best) {
    throw new Error("Unable to compress image");
  }

  return {
    ...best,
    url: URL.createObjectURL(best.blob),
  };
}

export default function ImageCompressorPage() {
  const t = useTranslations("tools.categories.image.tools.image_compressor");
  const useCases = asList<TextBlock>(t.raw("use_cases.items"));
  const platformLimits = asList<PlatformLimit>(t.raw("platform_limits.items"));
  const faqs = asList<FaqItem>(t.raw("faq.items"));
  const [file, setFile] = useState<File | null>(null);
  const [targetKb, setTargetKb] = useState(500);
  const [format, setFormat] = useState<OutputFormat>("image/jpeg");
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [compressing, setCompressing] = useState(false);

  const originalPreviewUrl = useMemo(() => {
    if (!file) {
      return "";
    }

    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (originalPreviewUrl) {
        URL.revokeObjectURL(originalPreviewUrl);
      }
    };
  }, [originalPreviewUrl]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];

    if (!nextFile) {
      return;
    }

    if (!nextFile.type.startsWith("image/")) {
      toast.error(t("invalid_file"));
      return;
    }

    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }

    setFile(nextFile);
    setResult(null);
  }

  async function handleCompress() {
    if (!file) {
      toast.error(t("upload_required"));
      return;
    }

    const safeTargetKb = Math.max(10, targetKb || 10);
    setCompressing(true);

    try {
      if (result?.url) {
        URL.revokeObjectURL(result.url);
      }

      const compressed = await compressToTargetSize({
        file,
        targetBytes: safeTargetKb * 1024,
        format,
      });

      setResult(compressed);

      if (compressed.blob.size > safeTargetKb * 1024) {
        toast.warning(t("target_warning"));
      } else {
        toast.success(t("success"));
      }
    } catch (error) {
      toast.error(t("error"));
    } finally {
      setCompressing(false);
    }
  }

  function handleDownload() {
    if (!result || !file) {
      return;
    }

    const baseName = file.name.replace(/\.[^.]+$/, "");
    const link = document.createElement("a");
    link.href = result.url;
    link.download = `${baseName}-compressed.${getExtension(result.format)}`;
    link.click();
  }

  function handleClear() {
    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }

    setFile(null);
    setResult(null);
  }

  const originalSize = file ? formatBytes(file.size) : "-";
  const resultSize = result ? formatBytes(result.blob.size) : "-";
  const savedPercent =
    file && result
      ? Math.max(0, Math.round((1 - result.blob.size / file.size) * 100))
      : 0;

  return (
    <div className="md:max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6 max-w-3xl">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings_title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                {t("upload_label")}
              </label>
              <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/40 bg-muted/40 px-4 py-6 text-center transition-colors hover:border-primary hover:bg-muted">
                <Upload className="mb-3 size-8 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {file ? file.name : t("upload_placeholder")}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {t("upload_hint")}
                </span>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                {t("target_size")}
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={10}
                  value={targetKb}
                  onChange={(event) => setTargetKb(Number(event.target.value))}
                />
                <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                  KB
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {TARGET_PRESETS.map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant={targetKb === preset ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTargetKb(preset)}
                  >
                    {preset === 1024 ? "1 MB" : `${preset} KB`}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                {t("format")}
              </label>
              <Select
                value={format}
                onValueChange={(value) => setFormat(value as OutputFormat)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image/jpeg">JPG</SelectItem>
                  <SelectItem value="image/webp">WebP</SelectItem>
                  <SelectItem value="image/png">PNG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                onClick={handleCompress}
                disabled={compressing}
                className="flex-1"
              >
                {compressing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ImageDown className="size-4" />
                )}
                {compressing ? t("compressing") : t("compress")}
              </Button>
              <Button type="button" variant="outline" onClick={handleClear}>
                {t("clear")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("result_title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border bg-muted/40 p-4">
                  <div className="text-xs text-muted-foreground">
                    {t("original_size")}
                  </div>
                  <div className="mt-1 text-xl font-semibold">
                    {originalSize}
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/40 p-4">
                  <div className="text-xs text-muted-foreground">
                    {t("compressed_size")}
                  </div>
                  <div className="mt-1 text-xl font-semibold">
                    {resultSize}
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/40 p-4">
                  <div className="text-xs text-muted-foreground">
                    {t("saved")}
                  </div>
                  <div className="mt-1 text-xl font-semibold">
                    {result ? `${savedPercent}%` : "-"}
                  </div>
                </div>
              </div>

              {result && (
                <div className="mt-5 flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-muted-foreground">
                    {t("output_detail", {
                      width: result.width,
                      height: result.height,
                      quality: Math.round(result.quality * 100),
                    })}
                  </div>
                  <Button type="button" onClick={handleDownload}>
                    <Download className="size-4" />
                    {t("download")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("original_preview")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
                  {originalPreviewUrl ? (
                    <img
                      src={originalPreviewUrl}
                      alt={t("original_preview")}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {t("no_image")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("compressed_preview")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
                  {result ? (
                    <img
                      src={result.url}
                      alt={t("compressed_preview")}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {t("no_result")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

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
          <h2 className="text-2xl font-bold">{t("platform_limits.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("platform_limits.description")}
          </p>
        </div>
        <div className="mt-6 overflow-hidden rounded-lg border">
          <div className="grid grid-cols-[1fr_1fr_1.4fr] bg-muted px-4 py-3 text-sm font-medium">
            <div>{t("platform_limits.platform")}</div>
            <div>{t("platform_limits.limit")}</div>
            <div>{t("platform_limits.note")}</div>
          </div>
          {platformLimits.map((item) => (
            <div
              key={item.platform}
              className="grid grid-cols-[1fr_1fr_1.4fr] border-t px-4 py-3 text-sm"
            >
              <div className="font-medium">{item.platform}</div>
              <div className="text-muted-foreground">{item.limit}</div>
              <div className="text-muted-foreground">{item.note}</div>
            </div>
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
