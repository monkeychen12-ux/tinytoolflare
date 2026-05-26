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
import {
  ArrowDown,
  ArrowUp,
  Download,
  FileText,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type PageSize = "a4" | "letter" | "auto";
type Orientation = "portrait" | "landscape";
type MarginSize = "none" | "small" | "normal";

interface ImageItem {
  id: string;
  file: File;
  url: string;
  width: number;
  height: number;
}

interface PdfResult {
  blob: Blob;
  url: string;
}

interface TextBlock {
  title: string;
  description: string;
}

interface UploadNeed {
  scenario: string;
  pdfTip: string;
  orderTip: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
};

const MARGINS = {
  none: 0,
  small: 18,
  normal: 36,
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

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function encodeAscii(value: string) {
  return new TextEncoder().encode(value);
}

function concatBytes(parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;

  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }

  return output;
}

function sanitizePdfFileName(value: string) {
  const normalized = value
    .trim()
    .replace(/\.pdf$/i, "")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "images-to-pdf";
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

function canvasToJpeg(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error("Unable to convert image"));
          return;
        }

        resolve(new Uint8Array(await blob.arrayBuffer()));
      },
      "image/jpeg",
      quality
    );
  });
}

async function imageToJpegData(file: File, quality: number) {
  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not supported");
  }

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);

  return {
    data: await canvasToJpeg(canvas, quality),
    width: canvas.width,
    height: canvas.height,
  };
}

function getPageDimensions(
  image: { width: number; height: number },
  pageSize: PageSize,
  orientation: Orientation
) {
  if (pageSize === "auto") {
    const longSide = 792;
    const aspect = image.width / image.height;

    if (aspect >= 1) {
      return { width: longSide, height: longSide / aspect };
    }

    return { width: longSide * aspect, height: longSide };
  }

  const base = PAGE_SIZES[pageSize];

  if (orientation === "landscape") {
    return { width: base.height, height: base.width };
  }

  return base;
}

function getDrawBox({
  image,
  page,
  margin,
}: {
  image: { width: number; height: number };
  page: { width: number; height: number };
  margin: number;
}) {
  const maxWidth = Math.max(1, page.width - margin * 2);
  const maxHeight = Math.max(1, page.height - margin * 2);
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
  const width = image.width * scale;
  const height = image.height * scale;

  return {
    x: (page.width - width) / 2,
    y: (page.height - height) / 2,
    width,
    height,
  };
}

function createPdfFromImages({
  images,
  pageSize,
  orientation,
  margin,
}: {
  images: Array<{ data: Uint8Array; width: number; height: number }>;
  pageSize: PageSize;
  orientation: Orientation;
  margin: MarginSize;
}) {
  const objects = new Map<number, Uint8Array>();
  const pageObjectIds: number[] = [];
  let nextObjectId = 3;

  for (let index = 0; index < images.length; index++) {
    const image = images[index];
    const page = getPageDimensions(image, pageSize, orientation);
    const draw = getDrawBox({
      image,
      page,
      margin: MARGINS[margin],
    });
    const imageObjectId = nextObjectId++;
    const contentObjectId = nextObjectId++;
    const pageObjectId = nextObjectId++;
    const imageName = `Im${index + 1}`;
    const content = `q\n${draw.width.toFixed(2)} 0 0 ${draw.height.toFixed(
      2
    )} ${draw.x.toFixed(2)} ${draw.y.toFixed(2)} cm\n/${imageName} Do\nQ\n`;
    const contentBytes = encodeAscii(content);

    objects.set(imageObjectId, concatBytes([
      encodeAscii(
        `${imageObjectId} 0 obj\n<<\n/Type /XObject\n/Subtype /Image\n/Width ${image.width}\n/Height ${image.height}\n/ColorSpace /DeviceRGB\n/BitsPerComponent 8\n/Filter /DCTDecode\n/Length ${image.data.length}\n>>\nstream\n`
      ),
      image.data,
      encodeAscii("\nendstream\nendobj\n"),
    ]));
    objects.set(contentObjectId,
      encodeAscii(
        `${contentObjectId} 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n${content}endstream\nendobj\n`
      )
    );
    objects.set(pageObjectId,
      encodeAscii(
        `${pageObjectId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.width.toFixed(
          2
        )} ${page.height.toFixed(
          2
        )}] /Resources << /ProcSet [/PDF /ImageC] /XObject << /${imageName} ${imageObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>\nendobj\n`
      )
    );
    pageObjectIds.push(pageObjectId);
  }

  objects.set(1, encodeAscii("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"));
  objects.set(2,
    encodeAscii(
      `2 0 obj\n<< /Type /Pages /Count ${pageObjectIds.length} /Kids [${pageObjectIds
        .map((id) => `${id} 0 R`)
        .join(" ")}] >>\nendobj\n`
    )
  );

  const chunks: Uint8Array[] = [encodeAscii("%PDF-1.4\n% TinyToolFlare\n")];
  const maxObjectId = Math.max(...Array.from(objects.keys()));
  const offsets = new Array(maxObjectId + 1).fill(0);
  let byteOffset = chunks[0].length;

  for (let id = 1; id <= maxObjectId; id++) {
    const objectBytes = objects.get(id);

    if (!objectBytes) {
      throw new Error(`Missing PDF object ${id}`);
    }

    offsets[id] = byteOffset;
    chunks.push(objectBytes);
    byteOffset += objectBytes.length;
  }

  const xrefOffset = byteOffset;
  const xref =
    `xref\n0 ${maxObjectId + 1}\n0000000000 65535 f \n` +
    offsets
      .slice(1)
      .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
      .join("") +
    `trailer\n<< /Size ${maxObjectId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  chunks.push(encodeAscii(xref));

  return new Blob([concatBytes(chunks)], { type: "application/pdf" });
}

export default function ImagesToPdfPage() {
  const t = useTranslations("tools.categories.image.tools.images_to_pdf");
  const useCases = asList<TextBlock>(t.raw("use_cases.items"));
  const uploadNeeds = asList<UploadNeed>(t.raw("upload_needs.items"));
  const faqs = asList<FaqItem>(t.raw("faq.items"));
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margin, setMargin] = useState<MarginSize>("normal");
  const [quality, setQuality] = useState(0.92);
  const [fileName, setFileName] = useState("images-to-pdf");
  const [pdfResult, setPdfResult] = useState<PdfResult | null>(null);
  const [creating, setCreating] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    const nextImages: ImageItem[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(t("invalid_file"));
        continue;
      }

      try {
        const image = await loadImage(file);
        nextImages.push({
          id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
          file,
          url: URL.createObjectURL(file),
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
      } catch (error) {
        toast.error(t("load_error"));
      }
    }

    if (nextImages.length > 0) {
      setImages((current) => [...current, ...nextImages]);
      setPdfResult(null);
    }
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((current) => {
      const next = [...current];
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= next.length) {
        return current;
      }

      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
    setPdfResult(null);
  }

  function removeImage(index: number) {
    setImages((current) => {
      const removed = current[index];
      if (removed) {
        URL.revokeObjectURL(removed.url);
      }

      return current.filter((_, itemIndex) => itemIndex !== index);
    });
    setPdfResult(null);
  }

  async function handleCreatePdf() {
    if (images.length === 0) {
      toast.error(t("upload_required"));
      return;
    }

    setCreating(true);

    try {
      if (pdfResult?.url) {
        URL.revokeObjectURL(pdfResult.url);
      }

      const encodedImages = [];

      for (const image of images) {
        encodedImages.push(await imageToJpegData(image.file, quality));
      }

      const blob = createPdfFromImages({
        images: encodedImages,
        pageSize,
        orientation,
        margin,
      });

      setPdfResult({
        blob,
        url: URL.createObjectURL(blob),
      });
      toast.success(t("success"));
    } catch (error) {
      toast.error(t("error"));
    } finally {
      setCreating(false);
    }
  }

  function handleDownload() {
    if (!pdfResult) {
      return;
    }

    const link = document.createElement("a");
    link.href = pdfResult.url;
    link.download = `${sanitizePdfFileName(fileName)}.pdf`;
    link.click();
  }

  function handleClear() {
    images.forEach((image) => URL.revokeObjectURL(image.url));
    if (pdfResult?.url) {
      URL.revokeObjectURL(pdfResult.url);
    }

    setImages([]);
    setPdfResult(null);
  }

  const totalSize = useMemo(
    () => images.reduce((sum, image) => sum + image.file.size, 0),
    [images]
  );

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
                  {t("upload_placeholder")}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {t("upload_hint")}
                </span>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(event) => handleFiles(event.target.files)}
                  className="sr-only"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t("file_name")}
                </label>
                <Input
                  value={fileName}
                  onChange={(event) => setFileName(event.target.value)}
                  placeholder={t("file_name_placeholder")}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t("page_size")}
                </label>
                <Select
                  value={pageSize}
                  onValueChange={(value) => setPageSize(value as PageSize)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4</SelectItem>
                    <SelectItem value="letter">Letter</SelectItem>
                    <SelectItem value="auto">{t("auto_size")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t("orientation")}
                </label>
                <Select
                  value={orientation}
                  onValueChange={(value) =>
                    setOrientation(value as Orientation)
                  }
                  disabled={pageSize === "auto"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">{t("portrait")}</SelectItem>
                    <SelectItem value="landscape">{t("landscape")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t("margin")}
                </label>
                <Select
                  value={margin}
                  onValueChange={(value) => setMargin(value as MarginSize)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">{t("margin_normal")}</SelectItem>
                    <SelectItem value="small">{t("margin_small")}</SelectItem>
                    <SelectItem value="none">{t("margin_none")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t("quality")}
                </label>
                <Select
                  value={String(quality)}
                  onValueChange={(value) => setQuality(Number(value))}
                >
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
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-muted/40 p-4">
                <div className="text-xs text-muted-foreground">
                  {t("images_count")}
                </div>
                <div className="mt-1 text-xl font-semibold">
                  {images.length}
                </div>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <div className="text-xs text-muted-foreground">
                  {t("input_size")}
                </div>
                <div className="mt-1 text-xl font-semibold">
                  {images.length ? formatBytes(totalSize) : "-"}
                </div>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <div className="text-xs text-muted-foreground">
                  {t("pdf_size")}
                </div>
                <div className="mt-1 text-xl font-semibold">
                  {pdfResult ? formatBytes(pdfResult.blob.size) : "-"}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                onClick={handleCreatePdf}
                disabled={creating}
                className="flex-1"
              >
                {creating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileText className="size-4" />
                )}
                {creating ? t("creating") : t("create_pdf")}
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
              <CardTitle>{t("image_order_title")}</CardTitle>
            </CardHeader>
            <CardContent>
              {images.length > 0 ? (
                <div className="space-y-3">
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      className="grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-lg border p-3"
                    >
                      <img
                        src={image.url}
                        alt={image.file.name}
                        className="size-14 rounded-md object-cover"
                      />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {index + 1}. {image.file.name}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {image.width}×{image.height} ·{" "}
                          {formatBytes(image.file.size)}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => moveImage(index, -1)}
                          disabled={index === 0}
                          aria-label={t("move_up")}
                        >
                          <ArrowUp className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => moveImage(index, 1)}
                          disabled={index === images.length - 1}
                          aria-label={t("move_down")}
                        >
                          <ArrowDown className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeImage(index)}
                          aria-label={t("remove_image")}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border bg-muted/30 p-6 text-center">
                  <FileText className="mb-3 size-8 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    {t("empty_images")}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("result_title")}</CardTitle>
            </CardHeader>
            <CardContent>
              {pdfResult ? (
                <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-medium">{t("result_ready")}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {t("result_detail", {
                        count: images.length,
                        size: formatBytes(pdfResult.blob.size),
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
          <h2 className="text-2xl font-bold">{t("upload_needs.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("upload_needs.description")}
          </p>
        </div>
        <div className="mt-6 overflow-hidden rounded-lg border">
          <div className="grid grid-cols-[1fr_1.4fr_1.4fr] bg-muted px-4 py-3 text-sm font-medium">
            <div>{t("upload_needs.scenario")}</div>
            <div>{t("upload_needs.pdf_tip")}</div>
            <div>{t("upload_needs.order_tip")}</div>
          </div>
          {uploadNeeds.map((item) => (
            <div
              key={item.scenario}
              className="grid grid-cols-[1fr_1.4fr_1.4fr] border-t px-4 py-3 text-sm"
            >
              <div className="font-medium">{item.scenario}</div>
              <div className="text-muted-foreground">{item.pdfTip}</div>
              <div className="text-muted-foreground">{item.orderTip}</div>
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
