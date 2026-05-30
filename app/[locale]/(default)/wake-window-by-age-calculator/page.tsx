"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Baby,
  CalendarClock,
  Clock,
  Moon,
  RotateCcw,
  Sunrise,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";

interface TextBlock {
  title: string;
  description: string;
}

interface AgeGuide {
  age: string;
  window: string;
  naps: string;
  note: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface WakeWindowRange {
  min: number;
  max: number;
  naps: string;
  explanationKey: string;
}

const agePresets = [1, 2, 3, 4, 6, 9, 12, 18, 24];

const wakeWindowRanges: Array<{
  maxAge: number;
  min: number;
  max: number;
  naps: string;
  explanationKey: string;
}> = [
  { maxAge: 1, min: 45, max: 75, naps: "4-6", explanationKey: "newborn" },
  { maxAge: 2, min: 60, max: 90, naps: "4-5", explanationKey: "young_infant" },
  { maxAge: 3, min: 75, max: 110, naps: "4-5", explanationKey: "three_months" },
  { maxAge: 4, min: 90, max: 120, naps: "3-4", explanationKey: "four_months" },
  { maxAge: 5, min: 105, max: 150, naps: "3-4", explanationKey: "five_months" },
  { maxAge: 6, min: 120, max: 180, naps: "3", explanationKey: "six_months" },
  { maxAge: 8, min: 150, max: 210, naps: "2-3", explanationKey: "older_infant" },
  { maxAge: 11, min: 180, max: 240, naps: "2", explanationKey: "two_nap" },
  { maxAge: 15, min: 210, max: 270, naps: "1-2", explanationKey: "transition" },
  { maxAge: 24, min: 270, max: 360, naps: "1", explanationKey: "toddler" },
  { maxAge: 36, min: 300, max: 420, naps: "0-1", explanationKey: "older_toddler" },
];

function asList<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value && typeof value === "object") {
    return Object.values(value) as T[];
  }

  return [];
}

function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function parseAge(value: string) {
  if (!value.trim()) {
    return null;
  }

  const age = Number(value);
  return Number.isFinite(age) ? age : null;
}

function getWakeWindow(ageMonths: number): WakeWindowRange {
  const range =
    wakeWindowRanges.find((item) => ageMonths <= item.maxAge) ??
    wakeWindowRanges[wakeWindowRanges.length - 1];

  return {
    min: range.min,
    max: range.max,
    naps: range.naps,
    explanationKey: range.explanationKey,
  };
}

function formatDuration(
  minutes: number,
  t: ReturnType<typeof useTranslations>
) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return t("duration.minutes", { count: mins });
  }

  if (mins === 0) {
    return t("duration.hours", { count: hours });
  }

  return t("duration.hours_minutes", { hours, minutes: mins });
}

function parseTimeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function formatClock(minutes: number, locale: string) {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;

  if (locale === "zh") {
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  }

  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;

  return `${displayHour}:${mins.toString().padStart(2, "0")} ${suffix}`;
}

export default function WakeWindowByAgeCalculatorPage() {
  const locale = useLocale();
  const t = useTranslations(
    "tools.categories.life.tools.wake_window_by_age_calculator"
  );
  const useCases = asList<TextBlock>(t.raw("use_cases.items"));
  const ageGuide = asList<AgeGuide>(t.raw("age_guide.items"));
  const faqs = asList<FaqItem>(t.raw("faq.items"));
  const [ageMonths, setAgeMonths] = useState("6");
  const [lastWakeTime, setLastWakeTime] = useState("07:00");

  const result = useMemo(() => {
    const age = parseAge(ageMonths);
    const errors: string[] = [];

    if (age === null || age < 0 || age > 36) {
      errors.push(t("validation.age"));
    }

    const wakeMinutes = parseTimeToMinutes(lastWakeTime);

    if (wakeMinutes === null) {
      errors.push(t("validation.time"));
    }

    if (errors.length > 0 || age === null || wakeMinutes === null) {
      return {
        errors,
        range: getWakeWindow(6),
        nextNapStart: "",
        nextNapEnd: "",
      };
    }

    const range = getWakeWindow(age);

    return {
      errors,
      range,
      nextNapStart: formatClock(wakeMinutes + range.min, locale),
      nextNapEnd: formatClock(wakeMinutes + range.max, locale),
    };
  }, [ageMonths, lastWakeTime, locale, t]);

  const windowLabel = `${formatDuration(result.range.min, t)} - ${formatDuration(
    result.range.max,
    t
  )}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: t("title"),
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      url: "https://www.tinytoolflare.com/wake-window-by-age-calculator",
      description: t("page_description"),
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "wake window calculator",
        "wake windows by age",
        "next nap window calculator",
        "baby sleep schedule helper",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <div className="mb-6 max-w-3xl">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,520px)_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Baby className="size-5" />
              {t("tool_title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <label className="space-y-2">
              <span className="text-sm font-medium">{t("age_label")}</span>
              <Input
                type="number"
                min="0"
                max="36"
                step="0.5"
                value={ageMonths}
                onChange={(event) => setAgeMonths(event.target.value)}
              />
            </label>

            <div>
              <div className="mb-2 text-sm font-medium">{t("age_presets")}</div>
              <div className="flex flex-wrap gap-2">
                {agePresets.map((age) => (
                  <Button
                    key={age}
                    type="button"
                    variant={ageMonths === age.toString() ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAgeMonths(age.toString())}
                  >
                    {t("months_short", { count: age })}
                  </Button>
                ))}
              </div>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium">
                {t("last_wake_time_label")}
              </span>
              <Input
                type="time"
                value={lastWakeTime}
                onChange={(event) => setLastWakeTime(event.target.value)}
              />
            </label>

            <Alert>
              <AlertCircle className="size-4" />
              <AlertTitle>{t("note_title")}</AlertTitle>
              <AlertDescription>{t("note_text")}</AlertDescription>
            </Alert>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAgeMonths("6");
                setLastWakeTime("07:00");
              }}
            >
              <RotateCcw className="size-4" />
              {t("reset")}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CalendarClock className="size-5" />
                {t("result_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {result.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>{t("check_inputs")}</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc space-y-1 pl-4">
                      {result.errors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-primary/5 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="size-4" />
                    {t("wake_window_label")}
                  </div>
                  <div className="mt-2 text-3xl font-bold">{windowLabel}</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("range_caption")}
                  </p>
                </div>

                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Moon className="size-4" />
                    {t("nap_count_label")}
                  </div>
                  <div className="mt-2 text-3xl font-bold">
                    {result.range.naps}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("nap_count_caption")}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sunrise className="size-4" />
                  {t("next_nap_label")}
                </div>
                <div className="mt-2 text-3xl font-bold">
                  {result.nextNapStart && result.nextNapEnd
                    ? `${result.nextNapStart} - ${result.nextNapEnd}`
                    : "-"}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`explanations.${result.range.explanationKey}`)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("how_to_use_title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>{t("how_to_use_text")}</p>
              <p>{t("safety_text")}</p>
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
          <h2 className="text-2xl font-bold">{t("age_guide.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("age_guide.description")}
          </p>
        </div>
        <div className="mt-6 overflow-hidden rounded-lg border">
          <div className="grid min-w-[760px] grid-cols-[1fr_1fr_1fr_1.6fr] bg-muted px-4 py-3 text-sm font-medium">
            <div>{t("age_guide.age")}</div>
            <div>{t("age_guide.window")}</div>
            <div>{t("age_guide.naps")}</div>
            <div>{t("age_guide.note")}</div>
          </div>
          <div className="overflow-x-auto">
            {ageGuide.map((item) => (
              <div
                key={item.age}
                className="grid min-w-[760px] grid-cols-[1fr_1fr_1fr_1.6fr] border-t px-4 py-3 text-sm"
              >
                <div className="font-medium">{item.age}</div>
                <div className="text-muted-foreground">{item.window}</div>
                <div className="text-muted-foreground">{item.naps}</div>
                <div className="text-muted-foreground">{item.note}</div>
              </div>
            ))}
          </div>
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
