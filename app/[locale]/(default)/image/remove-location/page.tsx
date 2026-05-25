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
import { Download, ImageOff, Loader2, ShieldCheck, Upload } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

interface CleanResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  format: OutputFormat;
}

interface TextBlock {
  title: string;
  description: string;
}

interface ShareRisk {
  place: string;
  risk: string;
  advice: string;
}

interface FaqItem {
  question: string;
  answer: string;
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

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getOutputFormat(file: File): OutputFormat {
  if (file.type === "image/png" || file.type === "image/webp") {
    return file.type;
  }

  return "image/jpeg";
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
  format: OutputFormat
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Unable to clean photo"));
        }
      },
      format,
      format === "image/png" ? undefined : 0.94
    );
  });
}

async function removePhotoMetadata(file: File): Promise<CleanResult> {
  const image = await loadImage(file);
  const format = getOutputFormat(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not supported");
  }

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  if (format === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(image, 0, 0);
  const blob = await canvasToBlob(canvas, format);

  return {
    blob,
    url: URL.createObjectURL(blob),
    width: canvas.width,
    height: canvas.height,
    format,
  };
}

export default function PhotoLocationRemoverPage() {
  const t = useTranslations("tools.categories.image.tools.photo_location_remover");
  const useCases = asList<TextBlock>(t.raw("use_cases.items"));
  const shareRisks = asList<ShareRisk>(t.raw("share_risks.items"));
  const faqs = asList<FaqItem>(t.raw("faq.items"));
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CleanResult | null>(null);
  const [processing, setProcessing] = useState(false);

  const previewUrl = useMemo(() => {
    if (!file) {
      return "";
    }

    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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

  async function handleRemoveLocation() {
    if (!file) {
      toast.error(t("upload_required"));
      return;
    }

    setProcessing(true);

    try {
      if (result?.url) {
        URL.revokeObjectURL(result.url);
      }

      const cleanPhoto = await removePhotoMetadata(file);
      setResult(cleanPhoto);
      toast.success(t("success"));
    } catch (error) {
      toast.error(t("error"));
    } finally {
      setProcessing(false);
    }
  }

  function handleDownload() {
    if (!result || !file) {
      return;
    }

    const baseName = file.name.replace(/\.[^.]+$/, "");
    const link = document.createElement("a");
    link.href = result.url;
    link.download = `${baseName}-no-location.${getExtension(result.format)}`;
    link.click();
  }

  function handleClear() {
    if (result?.url) {
      URL.revokeObjectURL(result.url);
    }

    setFile(null);
    setResult(null);
  }

  return (
    <div className="md:max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6 max-w-3xl">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t("tool_title")}</CardTitle>
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

            <div className="grid gap-3">
              <div className="rounded-lg border bg-muted/40 p-4">
                <div className="text-xs text-muted-foreground">
                  {t("original_size")}
                </div>
                <div className="mt-1 text-xl font-semibold">
                  {file ? formatBytes(file.size) : "-"}
                </div>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <div className="text-xs text-muted-foreground">
                  {t("clean_size")}
                </div>
                <div className="mt-1 text-xl font-semibold">
                  {result ? formatBytes(result.blob.size) : "-"}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                onClick={handleRemoveLocation}
                disabled={processing}
                className="flex-1"
              >
                {processing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ShieldCheck className="size-4" />
                )}
                {processing ? t("processing") : t("remove")}
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
              {result ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div>
                      <div className="font-medium">{t("result_success")}</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {t("result_detail", {
                          width: result.width,
                          height: result.height,
                          format: getExtension(result.format).toUpperCase(),
                        })}
                      </div>
                    </div>
                  </div>
                  <Button type="button" onClick={handleDownload}>
                    <Download className="size-4" />
                    {t("download")}
                  </Button>
                </div>
              ) : (
                <div className="flex min-h-32 flex-col items-center justify-center rounded-lg border bg-muted/30 p-6 text-center">
                  <ImageOff className="mb-3 size-8 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    {t("empty_result")}
                  </div>
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
                  {previewUrl ? (
                    <img
                      src={previewUrl}
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
                <CardTitle>{t("clean_preview")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
                  {result ? (
                    <img
                      src={result.url}
                      alt={t("clean_preview")}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {t("no_clean_image")}
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
          <h2 className="text-2xl font-bold">{t("share_risks.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("share_risks.description")}
          </p>
        </div>
        <div className="mt-6 overflow-hidden rounded-lg border">
          <div className="grid grid-cols-[1fr_1.2fr_1.4fr] bg-muted px-4 py-3 text-sm font-medium">
            <div>{t("share_risks.place")}</div>
            <div>{t("share_risks.risk")}</div>
            <div>{t("share_risks.advice")}</div>
          </div>
          {shareRisks.map((item) => (
            <div
              key={item.place}
              className="grid grid-cols-[1fr_1.2fr_1.4fr] border-t px-4 py-3 text-sm"
            >
              <div className="font-medium">{item.place}</div>
              <div className="text-muted-foreground">{item.risk}</div>
              <div className="text-muted-foreground">{item.advice}</div>
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
