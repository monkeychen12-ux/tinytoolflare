"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

function formatXML(xml: string): string {
  // 简单缩进美化XML（不处理所有边界情况）
  let formatted = "";
  const reg = /(>)(<)(\/*)/g;
  xml = xml.replace(reg, "$1\n$2$3");
  let pad = 0;
  xml.split("\n").forEach((node) => {
    let indent = 0;
    if (node.match(/^<\//)) {
      pad -= 2;
    } else if (node.match(/^<[^!?][^>]*[^\/]>/)) {
      indent = 2;
    }
    formatted += " ".repeat(pad) + node + "\n";
    pad += indent;
  });
  return formatted.trim();
}

export default function XMLFormatterPage() {
  const t = useTranslations("tools.categories.formatter.tools.xml_formatter");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleFormat = () => {
    setError("");
    try {
      // 检查XML有效性
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, "application/xml");
      const parserError = doc.getElementsByTagName("parsererror");
      if (parserError.length > 0) {
        throw new Error();
      }
      setOutput(formatXML(input));
      toast.success(t("success"));
    } catch {
      setError(t("invalid_xml"));
      setOutput("");
      toast.error(t("invalid_xml"));
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      toast.success(t("copied"));
    }
  };

  return (
    <div className="md:max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("input_title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            className="mb-4 min-h-[120px]"
            placeholder={t("input_placeholder")}
            value={input}
            onChange={e => setInput(e.target.value)}
            spellCheck={false}
          />
          <div className="flex gap-2">
            <Button onClick={handleFormat}>{t("format")}</Button>
            <Button variant="secondary" onClick={handleClear}>{t("clear")}</Button>
          </div>
          {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t("output_title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            className="mb-4 min-h-[120px]"
            value={output}
            readOnly
            spellCheck={false}
          />
          <Button onClick={handleCopy} disabled={!output}>{t("copy")}</Button>
        </CardContent>
      </Card>
      <div className="mt-8 text-sm text-muted-foreground leading-relaxed">
        <p>{t("description")}</p>
      </div>
    </div>
  );
} 