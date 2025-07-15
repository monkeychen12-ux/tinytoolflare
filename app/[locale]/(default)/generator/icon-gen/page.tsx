"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import JSZip from "jszip";
import { Ico, IcoImage } from "@fiahfy/ico";
import { Copy } from "lucide-react";

const ALL_ICON_SIZES = [16, 24, 32, 48, 64, 128, 180, 192, 256, 512];
const DEFAULT_ICON_SIZES = [16, 32, 48, 180, 192, 512];

function applyGrayOrColor(img: HTMLImageElement, size: number, isGray: boolean, customColor: string): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, size, size);
    if (isGray || customColor) {
      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (isGray) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = data[i + 1] = data[i + 2] = avg;
        }
        if (customColor) {
          // 简单叠加色彩（可优化为色相替换）
          const rgb = hexToRgb(customColor);
          if (rgb) {
            data[i] = (data[i] + rgb.r) / 2;
            data[i + 1] = (data[i + 1] + rgb.g) / 2;
            data[i + 2] = (data[i + 2] + rgb.b) / 2;
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, "image/png");
  });
}

function hexToRgb(hex: string) {
  if (!hex) return null;
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex.split("").map((x) => x + x).join("");
  }
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function parseColor(input: string): string | null {
  if (!input) return null;
  // 16进制
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(input)) return input;
  // rgb格式
  const rgbMatch = input.match(/^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    if ([r, g, b].every(x => x >= 0 && x <= 255)) {
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
  }
  return null;
}

export default function IconGenPage() {
  const t = useTranslations("tools.categories.generator.tools.icon_generator");
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<string>("png");
  const [customColor, setCustomColor] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [resultIcons, setResultIcons] = useState<any>({
    original: [],
    gray: [],
    custom: []
  });
  const [selectedSizes, setSelectedSizes] = useState<number[]>(DEFAULT_ICON_SIZES);
  const [showCopied, setShowCopied] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  }

  function handleSizeChange(size: number, checked: boolean) {
    setSelectedSizes((prev) =>
      checked ? Array.from(new Set([...prev, size])) : prev.filter((s) => s !== size)
    );
  }

  async function handleGenerate() {
    if (!file) {
      toast.error(t("input_title"));
      return;
    }
    setGenerating(true);
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      const original: any[] = [];
      const gray: any[] = [];
      const custom: any[] = [];
      const colorHex = parseColor(customColor);
      for (const size of selectedSizes) {
        // 原始
        const blobO = await applyGrayOrColor(img, size, false, "");
        const urlO = URL.createObjectURL(blobO);
        original.push({ url: urlO, size: `${size}x${size}`, blob: blobO });
        // 灰度
        const blobG = await applyGrayOrColor(img, size, true, "");
        const urlG = URL.createObjectURL(blobG);
        gray.push({ url: urlG, size: `${size}x${size}`, blob: blobG });
        // 自定义色
        if (colorHex) {
          const blobC = await applyGrayOrColor(img, size, false, colorHex);
          const urlC = URL.createObjectURL(blobC);
          custom.push({ url: urlC, size: `${size}x${size}`, blob: blobC });
        }
      }
      setResultIcons({ original, gray, custom });
      setGenerating(false);
      toast.success(t("success"));
    };
    img.onerror = () => {
      setGenerating(false);
      toast.error("图片加载失败");
    };
    img.src = url;
  }

  async function handleDownload() {
    const zip = new JSZip();
    // 原始
    if (resultIcons.original.length > 0) {
      if (format === "png") {
        for (const icon of resultIcons.original) {
          zip.file(`original/icon_${icon.size}.png`, icon.blob);
        }
      } else if (format === "ico") {
        const icoSizes = [16, 32, 48];
        const images: any[] = [];
        for (const size of icoSizes) {
          const icon = resultIcons.original.find((i: any) => i.size === `${size}x${size}`);
          if (icon) {
            const buf = await icon.blob.arrayBuffer();
            images.push(IcoImage.fromPNG(Buffer.from(buf)));
          }
        }
        const ico = new Ico();
        ico.images = images;
        zip.file("original/favicon.ico", ico.data);
      }
    }
    // 灰度
    if (resultIcons.gray.length > 0) {
      if (format === "png") {
        for (const icon of resultIcons.gray) {
          zip.file(`gray/icon_${icon.size}.png`, icon.blob);
        }
      } else if (format === "ico") {
        const icoSizes = [16, 32, 48];
        const images: any[] = [];
        for (const size of icoSizes) {
          const icon = resultIcons.gray.find((i: any) => i.size === `${size}x${size}`);
          if (icon) {
            const buf = await icon.blob.arrayBuffer();
            images.push(IcoImage.fromPNG(Buffer.from(buf)));
          }
        }
        const ico = new Ico();
        ico.images = images;
        zip.file("gray/favicon.ico", ico.data);
      }
    }
    // 自定义色
    if (resultIcons.custom.length > 0) {
      if (format === "png") {
        for (const icon of resultIcons.custom) {
          zip.file(`custom/icon_${icon.size}.png`, icon.blob);
        }
      } else if (format === "ico") {
        const icoSizes = [16, 32, 48];
        const images: any[] = [];
        for (const size of icoSizes) {
          const icon = resultIcons.custom.find((i: any) => i.size === `${size}x${size}`);
          if (icon) {
            const buf = await icon.blob.arrayBuffer();
            images.push(IcoImage.fromPNG(Buffer.from(buf)));
          }
        }
        const ico = new Ico();
        ico.images = images;
        zip.file("custom/favicon.ico", ico.data);
      }
    }
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "icons.zip";
    a.click();
  }

  function handleClear() {
    setFile(null);
    setResultIcons({ original: [], gray: [], custom: [] });
    setCustomColor("");
  }

  // 生成favicon代码片段
  function getFaviconHtml() {
    let html = '';
    if (format === "ico") {
      html += '<link rel="icon" type="image/x-icon" href="/favicon.ico">\n';
    }
    if (resultIcons.original.length > 0) {
      for (const icon of resultIcons.original) {
        const size = icon.size;
        if (format === "png") {
          html += `<link rel="icon" type="image/png" sizes="${size}" href="/icon_${size}.png">\n`;
        }
        if ([180, 192, 512].includes(Number(size.split('x')[0]))) {
          html += `<link rel="apple-touch-icon" sizes="${size}" href="/icon_${size}.png">\n`;
        }
      }
    }
    return html.trim();
  }

  function handleCopyFavicon() {
    navigator.clipboard.writeText(getFaviconHtml());
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 1200);
  }

  return (
    <div className="md:max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-extrabold mb-6">{t("title")}</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("description")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 mb-4">
            <div className="flex-1 space-y-4">
              <label className="font-medium block mb-1">{t("input_title")}</label>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
              {file && <div className="mt-2 text-sm text-muted-foreground">{file.name}</div>}
            </div>
            <div className="flex-1 space-y-4">
              <label className="font-medium block mb-1">{t("input_format")}</label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="ico">ICO</SelectItem>
                </SelectContent>
              </Select>
              <label className="font-medium block mb-1 mt-4">{t("select_sizes")}</label>
              <div className="flex flex-wrap gap-2">
                {ALL_ICON_SIZES.map(size => (
                  <label key={size} className="flex items-center gap-1 text-sm">
                    <input type="checkbox" checked={selectedSizes.includes(size)} onChange={e => handleSizeChange(size, e.target.checked)} className="accent-primary w-4 h-4 rounded" />
                    <span>{size}x{size}</span>
                  </label>
                ))}
              </div>
              <label className="font-medium block mb-1 mt-4">{t("input_custom_color")}</label>
              <div className="flex items-center gap-4">
                <Input type="color" value={parseColor(customColor) || "#000000"} onChange={e => setCustomColor(e.target.value)} className="w-10 h-10 p-0 border-none bg-transparent" />
                <Input type="text" value={customColor} onChange={e => setCustomColor(e.target.value)} placeholder="#RRGGBB 或 rgb(255,255,255)" className="w-40" />
                <span className="text-xs text-muted-foreground">#RRGGBB/#RGB/rgb(255,255,255)</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="default" onClick={handleGenerate} disabled={generating}>{t("generate")}</Button>
            <Button variant="default" onClick={handleDownload} disabled={Object.values(resultIcons).every((arr: any) => (arr as any[]).length === 0)}>{t("download")}</Button>
            <Button variant="secondary" onClick={handleClear}>{t("clear")}</Button>
          </div>
        </CardContent>
      </Card>
      {/* favicon代码片段展示区 */}
      {(resultIcons.original.length > 0) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t("favicon_code_title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-zinc-950 text-green-200 rounded-lg p-4 text-xs overflow-x-auto select-all whitespace-pre-wrap border border-zinc-800 shadow-sm transition-colors hover:bg-zinc-900">
                {getFaviconHtml()}
              </pre>
              <div className="flex justify-end mt-2">
                <Button size="sm" variant="secondary" onClick={handleCopyFavicon} className="flex items-center gap-1">
                  <Copy className="w-4 h-4" />
                  {showCopied ? <span className="text-green-600 text-xs">{t("copied")}</span> : <span className="text-xs">{t("copy_code")}</span>}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* 结果分区展示 */}
      {resultIcons.original.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Original</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {resultIcons.original.map((icon: any, idx: number) => (
                <div key={idx} className="flex flex-col items-center">
                  <img src={icon.url} alt={icon.size} className="w-16 h-16 border rounded mb-2" />
                  <div className="text-xs">{icon.size}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {resultIcons.gray.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Grayscale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {resultIcons.gray.map((icon: any, idx: number) => (
                <div key={idx} className="flex flex-col items-center">
                  <img src={icon.url} alt={icon.size} className="w-16 h-16 border rounded mb-2" />
                  <div className="text-xs">{icon.size}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {parseColor(customColor) && resultIcons.custom.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Custom Color</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {resultIcons.custom.map((icon: any, idx: number) => (
                <div key={idx} className="flex flex-col items-center">
                  <img src={icon.url} alt={icon.size} className="w-16 h-16 border rounded mb-2" />
                  <div className="text-xs">{icon.size}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* FAQ区块（合并说明） */}
      <div className="mt-10 space-y-8">
        <div>
          <div className="text-lg font-bold mb-2">{t("faq_what_is_favicon_title")}</div>
          <div className="text-muted-foreground" style={{ whiteSpace: 'pre-line' }}>{t("faq_what_is_favicon_desc")}</div>
        </div>
        <div>
          <div className="text-lg font-bold mb-2">{t("faq_why_favicon_title")}</div>
          <div className="text-muted-foreground" style={{ whiteSpace: 'pre-line' }}>{t("faq_why_favicon_desc")}</div>
        </div>
        <div>
          <div className="text-lg font-bold mb-2">{t("faq_how_to_use_title")}</div>
          <div className="text-muted-foreground" style={{ whiteSpace: 'pre-line' }}>
            <ol className="list-decimal pl-5 space-y-1">
              <li>{t("faq_how_to_use_step1").replace(/^\d+\.\s*/, "")}</li>
              <li>{t("faq_how_to_use_step2").replace(/^\d+\.\s*/, "")}</li>
              <li>{t("faq_how_to_use_step3").replace(/^\d+\.\s*/, "")}</li>
              <li>{t("faq_how_to_use_step4").replace(/^\d+\.\s*/, "")}</li>
              <li>{t("faq_how_to_use_step5").replace(/^\d+\.\s*/, "")}</li>
              <li>{t("faq_how_to_use_step6").replace(/^\d+\.\s*/, "")}</li>
              <li>{t("faq_how_to_use_step7").replace(/^\d+\.\s*/, "")}</li>
            </ol>
            <div className="mt-3">
              <div>{t("faq_how_to_use_note1")}</div>
              <div>{t("faq_how_to_use_note2")}</div>
              <div>{t("faq_how_to_use_note3")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 