"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Textarea } from "@/components/ui/textarea";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const NUMBER = "0123456789";
const SYMBOL = "!@#$%^&*()_+-=~[]{}|;:,.<>/?";

export default function PasswordGeneratorPage() {
  const t = useTranslations("tools.categories.generator.tools.password_generator");
  const [length, setLength] = useState(12);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [number, setNumber] = useState(true);
  const [symbol, setSymbol] = useState(false);
  const [result, setResult] = useState("");
  const [count, setCount] = useState(1);

  function generatePassword() {
    let chars = "";
    if (upper) chars += UPPER;
    if (lower) chars += LOWER;
    if (number) chars += NUMBER;
    if (symbol) chars += SYMBOL;
    if (!chars) {
      toast.error(t("description"));
      return;
    }
    let pwds: string[] = [];
    for (let j = 0; j < count; j++) {
      let pwd = "";
      for (let i = 0; i < length; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      pwds.push(pwd);
    }
    setResult(pwds.join("\n"));
    toast.success(t("success"));
  }

  function handleCopy() {
    if (result) {
      navigator.clipboard.writeText(result);
      toast.success(t("copied"));
    }
  }

  function handleClear() {
    setResult("");
  }

  function handleCopySingle(pwd: string) {
    navigator.clipboard.writeText(pwd);
    toast.success(t("copied"));
  }

  return (
    <div className="md:max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("input_title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <label className="font-medium whitespace-nowrap text-right min-w-[110px]">{t("input_length")}</label>
            <Input type="number" min={4} max={64} value={length} onChange={e => setLength(Number(e.target.value))} className="w-24" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <label className="font-medium whitespace-nowrap text-right min-w-[110px]">{t("input_count")}</label>
            <Input type="number" min={1} max={20} value={count} onChange={e => setCount(Number(e.target.value))} className="w-24" />
          </div>
          <div className="flex items-center gap-4 mb-2">
            <label className="font-medium whitespace-nowrap text-right min-w-[110px]">{t("input_uppercase")}</label>
            <Switch checked={upper} onCheckedChange={setUpper} />
          </div>
          <div className="flex items-center gap-4 mb-2">
            <label className="font-medium whitespace-nowrap text-right min-w-[110px]">{t("input_lowercase")}</label>
            <Switch checked={lower} onCheckedChange={setLower} />
          </div>
          <div className="flex items-center gap-4 mb-2">
            <label className="font-medium whitespace-nowrap text-right min-w-[110px]">{t("input_number")}</label>
            <Switch checked={number} onCheckedChange={setNumber} />
          </div>
          <div className="flex items-center gap-4 mb-2">
            <label className="font-medium whitespace-nowrap text-right min-w-[110px]">{t("input_symbol")}</label>
            <Switch checked={symbol} onCheckedChange={setSymbol} />
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="default" onClick={generatePassword}>{t("generate")}</Button>
            <Button variant="default" onClick={handleClear}>{t("clear")}</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t("result_title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {result
              ? result.split("\n").map((pwd, idx) => (
                  <div key={idx} className="flex items-center group">
                    <SyntaxHighlighter
                      language="text"
                      style={a11yDark}
                      customStyle={{
                        borderRadius: 6,
                        fontSize: 17,
                        padding: "8px 12px",
                        background: "#181a20",
                        outline: "none",
                        minHeight: 36,
                        margin: 0,
                        userSelect: "none",
                        width: "100%",
                        marginRight: 8,
                        display: "block",
                        lineHeight: 1.6,
                      }}
                      className="no-select flex-1"
                      showLineNumbers={false}
                    >
                      {pwd}
                    </SyntaxHighlighter>
                    <Button
                      size="sm"
                      variant="default"
                      className="ml-2 group-hover:opacity-100"
                      onClick={() => handleCopySingle(pwd)}
                    >
                      {t("copy")}
                    </Button>
                  </div>
                ))
              : <Input value={result} readOnly className="flex-1" />}
            {result && null}
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 text-muted-foreground text-sm leading-relaxed">
        <p>{t("description")}</p>
      </div>
      <div className="mt-8 text-sm text-muted-foreground leading-relaxed">
        <div className="font-bold mb-1">{t("security_title")}</div>
        {/* 分段美化安全建议 */}
        <ul className="list-decimal pl-5 space-y-1">
          {t("security_desc")
            .split(/\d+\. /)
            .filter(Boolean)
            .map((tip, idx) => (
              <li key={idx}>{tip.trim()}</li>
            ))}
        </ul>
      </div>
    </div>
  );
} 
