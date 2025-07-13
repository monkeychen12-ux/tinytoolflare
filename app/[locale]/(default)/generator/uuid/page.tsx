"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function UUIDGeneratorPage() {
  const [count, setCount] = useState(1);
  const [result, setResult] = useState("");
  const t = useTranslations("tools.categories.generator.tools.uuid_generator");

  function generateUUID() {
    let uuids: string[] = [];
    for (let i = 0; i < count; i++) {
      uuids.push(uuidv4());
    }
    setResult(uuids.join("\n"));
    toast.success(t("success"));
  }

  function handleCopySingle(uuid: string) {
    navigator.clipboard.writeText(uuid);
    toast.success(t("copied"));
  }

  function handleClear() {
    setResult("");
  }

  return (
    <div className="md:max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("description")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <label className="font-medium whitespace-nowrap text-right min-w-[110px]">{t("input_count")}</label>
            <Input type="number" min={1} max={20} value={count} onChange={e => setCount(Number(e.target.value))} className="w-24" />
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="default" onClick={generateUUID}>{t("generate")}</Button>
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
              ? result.split("\n").map((uuid, idx) => (
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
                      {uuid}
                    </SyntaxHighlighter>
                    <Button
                      size="sm"
                      variant="default"
                      className="ml-2 group-hover:opacity-100"
                      onClick={() => handleCopySingle(uuid)}
                    >
                      {t("copy")}
                    </Button>
                  </div>
                ))
              : <Input value={result} readOnly className="flex-1" />}
          </div>
        </CardContent>
      </Card>
      <div className="mt-8 text-sm text-muted-foreground leading-relaxed">
        <div className="font-bold mb-1">{t("about_title")}</div>
        <ul className="list-disc pl-5 space-y-1">
          {t("about_desc")
            .split(/\n+/)
            .filter(Boolean)
            .map((tip, idx) => (
              <li key={idx}>{tip.trim()}</li>
            ))}
        </ul>
      </div>
    </div>
  );
} 