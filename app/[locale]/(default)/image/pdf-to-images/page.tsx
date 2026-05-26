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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileImage, Loader2, Upload } from "lucide-react";
import JSZip from "jszip";
import { toast } from "sonner";
import { useState } from "react";
import { useTranslations } from "next-intl";

type ImageFormat = "png" | "jpg";

interface RenderedPage {
  pageNumber: number;
  blob: Blob;
  url: string;
  width: number;
  height: number;
}

interface TextBlock {
  title: string;
  description: string;
}

interface ExportNeed {
  scenario: string;
  formatTip: string;
  pageTip: string;
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

function sanitizeFileName(value: string) {
  const normalized = value
    .trim()
    .replace(/\.zip$/i, "")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "pdf-pages";
}

function parsePageRange(input: string, totalPages: number) {
  const trimmed = input.trim();

  if (!trimmed) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>();

  for (const part of trimmed.split(",")) {
    const segment = part.trim();
    const range = segment.match(/^(\d+)\s*-\s*(\d+)$/);

    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      const min = Math.min(start, end);
      const max = Math.max(start, end);

      for (let page = min; page <= max; page++) {
        if (page >= 1 && page <= totalPages) {
          pages.add(page);
        }
      }
    } else {
      const page = Number(segment);
      if (Number.isInteger(page) && page >= 1 && page <= totalPages) {
        pages.add(page);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: ImageFormat,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Unable to export image"));
        }
      },
      format === "png" ? "image/png" : "image/jpeg",
      format === "png" ? undefined : quality
    );
  });
}

export default function PdfToImagesPage() {
  const t = useTranslations("tools.categories.image.tools.pdf_to_images");
  const useCases = asList<TextBlock>(t.raw("use_cases.items"));
  const exportNeeds = asList<ExportNeed>(t.raw("export_needs.items"));
  const faqs = asList<FaqItem>(t.raw("faq.items"));
  const [file, setFile] = useState<File | null>(null);
  const [zipName, setZipName] = useState("pdf-pages");
  const [format, setFormat] = useState<ImageFormat>("png");
  const [scale, setScale] = useState("2");
  const [quality, setQuality] = useState("0.92");
  const [pageRange, setPageRange] = useState("");
  const [renderedPages, setRenderedPages] = useState<RenderedPage[]>([]);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [zipResult, setZipResult] = useState<{ blob: Blob; url: string } | null>(
    null
  );
  const [processing, setProcessing] = useState(false);

  function clearResults() {
    renderedPages.forEach((page) => URL.revokeObjectURL(page.url));
    if (zipResult?.url) {
      URL.revokeObjectURL(zipResult.url);
    }
    setRenderedPages([]);
    setZipResult(null);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];

    if (!nextFile) {
      return;
    }

    if (nextFile.type !== "application/pdf") {
      toast.error(t("invalid_file"));
      return;
    }

    clearResults();
    setFile(nextFile);
    setTotalPages(null);
  }

  async function handleConvert() {
    if (!file) {
      toast.error(t("upload_required"));
      return;
    }

    setProcessing(true);
    clearResults();

    try {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      // Keep the ESM worker outside Next's JS optimizer; Terser parses it as non-module.
      pdfjs.GlobalWorkerOptions.workerSrc =
        "/vendor/pdfjs/pdf.worker.min.mjs";
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({
        data: new Uint8Array(arrayBuffer),
      }).promise;
      const pages = parsePageRange(pageRange, pdf.numPages);

      if (pages.length === 0) {
        toast.error(t("invalid_range"));
        setProcessing(false);
        return;
      }

      const nextPages: RenderedPage[] = [];
      const zip = new JSZip();
      const exportScale = Number(scale);
      const exportQuality = Number(quality);
      const extension = format === "png" ? "png" : "jpg";

      for (const pageNumber of pages) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: exportScale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Canvas is not supported");
        }

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        if (format === "jpg") {
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
        }

        await page.render({
          canvas,
          canvasContext: context,
          viewport,
        }).promise;

        const blob = await canvasToBlob(canvas, format, exportQuality);
        const fileName = `page-${String(pageNumber).padStart(3, "0")}.${extension}`;
        zip.file(fileName, blob);
        nextPages.push({
          pageNumber,
          blob,
          url: URL.createObjectURL(blob),
          width: canvas.width,
          height: canvas.height,
        });
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      setRenderedPages(nextPages);
      setZipResult({
        blob: zipBlob,
        url: URL.createObjectURL(zipBlob),
      });
      setTotalPages(pdf.numPages);
      toast.success(t("success"));
    } catch (error) {
      console.error("PDF to images conversion failed", error);
      toast.error(t("error"));
    } finally {
      setProcessing(false);
    }
  }

  function handleDownload() {
    if (!zipResult) {
      return;
    }

    const link = document.createElement("a");
    link.href = zipResult.url;
    link.download = `${sanitizeFileName(zipName)}.zip`;
    link.click();
  }

  function handleClear() {
    clearResults();
    setFile(null);
    setTotalPages(null);
    setPageRange("");
  }

  return (
    <div className="md:max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6 max-w-3xl">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,440px)_1fr]">
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
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                {t("zip_name")}
              </label>
              <Input
                value={zipName}
                onChange={(event) => setZipName(event.target.value)}
                placeholder={t("zip_name_placeholder")}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                {t("page_range")}
              </label>
              <Input
                value={pageRange}
                onChange={(event) => setPageRange(event.target.value)}
                placeholder={t("page_range_placeholder")}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t("format")}
                </label>
                <Select
                  value={format}
                  onValueChange={(value) => setFormat(value as ImageFormat)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpg">JPG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t("scale")}
                </label>
                <Select value={scale} onValueChange={setScale}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">{t("scale_standard")}</SelectItem>
                    <SelectItem value="2">{t("scale_high")}</SelectItem>
                    <SelectItem value="3">{t("scale_print")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {format === "jpg" && (
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t("quality")}
                </label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.92">{t("quality_high")}</SelectItem>
                    <SelectItem value="0.78">{t("quality_balanced")}</SelectItem>
                    <SelectItem value="0.62">{t("quality_small")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-muted/40 p-4">
                <div className="text-xs text-muted-foreground">
                  {t("pdf_size")}
                </div>
                <div className="mt-1 text-xl font-semibold">
                  {file ? formatBytes(file.size) : "-"}
                </div>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <div className="text-xs text-muted-foreground">
                  {t("pages")}
                </div>
                <div className="mt-1 text-xl font-semibold">
                  {totalPages ?? "-"}
                </div>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <div className="text-xs text-muted-foreground">
                  {t("zip_size")}
                </div>
                <div className="mt-1 text-xl font-semibold">
                  {zipResult ? formatBytes(zipResult.blob.size) : "-"}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                onClick={handleConvert}
                disabled={processing}
                className="flex-1"
              >
                {processing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileImage className="size-4" />
                )}
                {processing ? t("converting") : t("convert")}
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
              {zipResult ? (
                <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-medium">{t("result_ready")}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {t("result_detail", {
                        count: renderedPages.length,
                        size: formatBytes(zipResult.blob.size),
                      })}
                    </div>
                  </div>
                  <Button type="button" onClick={handleDownload}>
                    <Download className="size-4" />
                    {t("download")}
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {t("empty_result")}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("preview_title")}</CardTitle>
            </CardHeader>
            <CardContent>
              {renderedPages.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {renderedPages.slice(0, 6).map((page) => (
                    <div key={page.pageNumber} className="rounded-lg border p-3">
                      <img
                        src={page.url}
                        alt={t("page_preview", { page: page.pageNumber })}
                        className="max-h-64 w-full rounded-md object-contain"
                      />
                      <div className="mt-2 text-xs text-muted-foreground">
                        {t("preview_detail", {
                          page: page.pageNumber,
                          width: page.width,
                          height: page.height,
                          size: formatBytes(page.blob.size),
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border bg-muted/30 p-6 text-center">
                  <FileImage className="mb-3 size-8 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    {t("empty_preview")}
                  </div>
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
        <div className="mt-6 grid gap-4 md:grid-cols-4">
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
          <h2 className="text-2xl font-bold">{t("export_needs.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("export_needs.description")}
          </p>
        </div>
        <div className="mt-6 overflow-hidden rounded-lg border">
          <div className="grid grid-cols-[1fr_1.4fr_1.4fr] bg-muted px-4 py-3 text-sm font-medium">
            <div>{t("export_needs.scenario")}</div>
            <div>{t("export_needs.format_tip")}</div>
            <div>{t("export_needs.page_tip")}</div>
          </div>
          {exportNeeds.map((item) => (
            <div
              key={item.scenario}
              className="grid grid-cols-[1fr_1.4fr_1.4fr] border-t px-4 py-3 text-sm"
            >
              <div className="font-medium">{item.scenario}</div>
              <div className="text-muted-foreground">{item.formatTip}</div>
              <div className="text-muted-foreground">{item.pageTip}</div>
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
