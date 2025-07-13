"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";


export default function JSONFormatterPage() {
  const t = useTranslations("tools.categories.formatter.tools.json_formatter");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleFormat = () => {
    setError("");
    try {
      const obj = JSON.parse(input);
      setOutput(JSON.stringify(obj, null, 2));
      toast.success(t("success"));
    } catch (e: any) {
      setError(t("invalid_json"));
      setOutput("");
      toast.error(t("invalid_json"));
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

  // 递归深层 JSON.parse
  function deepParse(obj: any): any {
    if (typeof obj === 'string') {
      try {
        const parsed = JSON.parse(obj);
        // 防止死循环：如果parse后还是字符串且和原字符串一样就不再递归
        if (typeof parsed === 'string' && parsed === obj) {
          return obj;
        }
        return deepParse(parsed);
      } catch {
        return obj;
      }
    } else if (Array.isArray(obj)) {
      return obj.map(deepParse);
    } else if (typeof obj === 'object' && obj !== null) {
      const res: any = {};
      for (const key in obj) {
        res[key] = deepParse(obj[key]);
      }
      return res;
    }
    return obj;
  }

  const handleDeepParse = () => {
    setError("");
    try {
      // 优先用input内容，保证是原始JSON
      const obj = JSON.parse(input);
      const parsed = deepParse(obj);
      setOutput(JSON.stringify(parsed, null, 2));
      toast.success(t("success"));
    } catch (e: any) {
      setError(t("invalid_json"));
      toast.error(t("invalid_json"));
    }
  };


  return (
    <div className="max-w-7xl mx-auto py-4 px-4">
      <h1 className="text-2xl font-semibold mb-4">{t("title")}</h1>
      <div className="flex flex-col md:flex-row gap-4">
        {/* 输入区 */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 mb-4 md:mb-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-normal">{t("input_title")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Textarea
                className="mb-2 min-h-[300px] max-h-[1000px] overflow-auto"
                placeholder={t("input_placeholder")}
                value={input}
                onChange={e => setInput(e.target.value)}
                spellCheck={false}
              />
              <div className="flex gap-2 flex-wrap mt-1">
                <Button onClick={handleFormat} size="sm">{t("format")}</Button>
                <Button variant="secondary" onClick={handleClear} size="sm">{t("clear")}</Button>
                <Button variant="outline" onClick={handleDeepParse} size="sm">{t("deep_parse")}</Button>
              </div>
              {error && <div className="mt-1 text-red-500 text-sm">{error}</div>}
            </CardContent>
          </Card>
        </div>
        {/* 输出区 */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-lg font-normal">{t("output_title")}</CardTitle>
              <Button onClick={handleCopy} disabled={!output} size="sm" variant="outline">{t("copy")}</Button>
            </CardHeader>
            <CardContent className="pt-0">
              {output ? (
                <SyntaxHighlighter
                  language="json"
                  style={a11yDark}
                  customStyle={{
                    borderRadius: 8,
                    fontSize: 14,
                    padding: 12,
                    background: '#181a20',
                    outline: 'none',
                    maxHeight: 1000,
                    minHeight: 300,
                    overflow: 'auto',
                  }}
                  className="mb-2 no-select"
                  showLineNumbers
                >
                  {output}
                </SyntaxHighlighter>
              ) : (
                <Textarea
                  className="mb-2 min-h-[300px] max-h-[1000px] overflow-auto"
                  value={output}
                  readOnly
                  spellCheck={false}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mt-6 text-sm text-muted-foreground leading-relaxed space-y-4">
        <div>
          <div className="text-base font-bold mb-1">{t("about_json_title")}</div>
          <div>{t("about_json")}
            
          </div>
        </div>
        <div>
          <div className="text-base font-bold mb-1">{t("feature_intro_title")}</div>
          <div>{t("feature_intro")}
          </div>
        </div>
        <div>
          <div className="text-base font-bold mb-1">{t("deep_parse_intro_title")}</div>
          <div>{t("deep_parse_intro")}
          
          </div>
        </div>
      </div>
    </div>
  );
} 