"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowRightLeft,
  Clipboard,
  Grid3X3,
  ListChecks,
  Printer,
  RefreshCcw,
  Shuffle,
  Users,
  Wand2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

const DEFAULT_STUDENTS = [
  "Avery",
  "Blake",
  "Casey",
  "Drew",
  "Eden",
  "Finley",
  "Harper",
  "Jamie",
  "Jordan",
  "Kai",
  "Logan",
  "Morgan",
  "Parker",
  "Quinn",
  "Reese",
  "Riley",
  "Rowan",
  "Sage",
  "Taylor",
  "Alex",
  "Cameron",
  "Devon",
  "Emery",
  "Skyler",
].join("\n");

const DEFAULT_FRONT_STUDENTS = ["Avery", "Morgan", "Taylor"].join("\n");
const DEFAULT_SEPARATE_PAIRS = ["Jordan, Riley", "Casey, Drew"].join("\n");
const DEFAULT_ROWS = "5";
const DEFAULT_COLUMNS = "6";
const DEFAULT_FRONT_ROWS = "1";
const MAX_ROWS = 10;
const MAX_COLUMNS = 10;

interface TextBlock {
  title: string;
  description: string;
}

interface ConstraintGuide {
  type: string;
  entry: string;
  behavior: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface SeparatePair {
  a: string;
  b: string;
}

interface SeatingEvaluation {
  frontViolations: string[];
  pairViolations: SeparatePair[];
  score: number;
}

interface SeatingChart extends SeatingEvaluation {
  emptyRoster: boolean;
  seats: Array<string | null>;
  signature: string;
  tooMany: boolean;
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

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function uniqueNames(names: string[]) {
  const seen = new Set<string>();

  return names.filter((name) => {
    const key = normalizeName(name);

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function parseNameList(value: string) {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1 && /[,;]/.test(value)) {
    return uniqueNames(
      value
        .split(/[,;]/)
        .map((item) => item.trim())
        .filter(Boolean)
    );
  }

  return uniqueNames(lines);
}

function matchRosterNames(requestedNames: string[], rosterNames: string[]) {
  const rosterByKey = new Map(
    rosterNames.map((name) => [normalizeName(name), name] as const)
  );
  const matched: string[] = [];
  const ignored: string[] = [];
  const seen = new Set<string>();

  requestedNames.forEach((name) => {
    const key = normalizeName(name);
    const rosterName = rosterByKey.get(key);

    if (!rosterName) {
      ignored.push(name);
      return;
    }

    if (!seen.has(key)) {
      matched.push(rosterName);
      seen.add(key);
    }
  });

  return { ignored, matched };
}

function parseSeparatePairs(value: string, rosterNames: string[]) {
  const rosterByKey = new Map(
    rosterNames.map((name) => [normalizeName(name), name] as const)
  );
  const pairKeys = new Set<string>();
  const pairs: SeparatePair[] = [];
  const ignoredLines: string[] = [];

  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      let parts = line
        .split(/\s*(?:,|\/|\+|\||;)\s*/)
        .map((part) => part.trim())
        .filter(Boolean);

      if (parts.length < 2) {
        parts = line
          .split(/\s+and\s+/i)
          .map((part) => part.trim())
          .filter(Boolean);
      }

      if (parts.length < 2) {
        ignoredLines.push(line);
        return;
      }

      const a = rosterByKey.get(normalizeName(parts[0]));
      const b = rosterByKey.get(normalizeName(parts[1]));

      if (!a || !b || normalizeName(a) === normalizeName(b)) {
        ignoredLines.push(line);
        return;
      }

      const key = [normalizeName(a), normalizeName(b)].sort().join("|");

      if (!pairKeys.has(key)) {
        pairs.push({ a, b });
        pairKeys.add(key);
      }
    });

  return { ignoredLines, pairs };
}

function parseGridSize(value: string, fallback: number, max: number) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(1, parsed));
}

function shuffleArray<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function getSeatPosition(index: number, columns: number) {
  return {
    column: index % columns,
    row: Math.floor(index / columns),
  };
}

function areAdjacent(indexA: number, indexB: number, columns: number) {
  const a = getSeatPosition(indexA, columns);
  const b = getSeatPosition(indexB, columns);

  return Math.abs(a.row - b.row) + Math.abs(a.column - b.column) === 1;
}

function evaluateSeats({
  columns,
  frontNames,
  frontRows,
  pairs,
  seats,
}: {
  columns: number;
  frontNames: string[];
  frontRows: number;
  pairs: SeparatePair[];
  seats: Array<string | null>;
}): SeatingEvaluation {
  const positions = new Map<string, number>();

  seats.forEach((name, index) => {
    if (name) {
      positions.set(normalizeName(name), index);
    }
  });

  const frontViolations = frontNames.filter((name) => {
    const position = positions.get(normalizeName(name));

    if (position === undefined) {
      return false;
    }

    return getSeatPosition(position, columns).row >= frontRows;
  });

  const pairViolations = pairs.filter((pair) => {
    const firstPosition = positions.get(normalizeName(pair.a));
    const secondPosition = positions.get(normalizeName(pair.b));

    if (firstPosition === undefined || secondPosition === undefined) {
      return false;
    }

    return areAdjacent(firstPosition, secondPosition, columns);
  });

  return {
    frontViolations,
    pairViolations,
    score: frontViolations.length * 10 + pairViolations.length * 12,
  };
}

function createSignature({
  columns,
  frontList,
  frontRows,
  pairList,
  rows,
  students,
}: {
  columns: number;
  frontList: string;
  frontRows: number;
  pairList: string;
  rows: number;
  students: string[];
}) {
  return JSON.stringify({
    columns,
    frontList,
    frontRows,
    pairList,
    rows,
    students,
  });
}

function buildSeatingChart({
  columns,
  frontNames,
  frontRows,
  pairs,
  rows,
  signature,
  students,
}: {
  columns: number;
  frontNames: string[];
  frontRows: number;
  pairs: SeparatePair[];
  rows: number;
  signature: string;
  students: string[];
}): SeatingChart {
  const seatCount = rows * columns;
  const emptySeats = Array.from<string | null>({ length: seatCount }).fill(null);

  if (students.length === 0) {
    return {
      emptyRoster: true,
      frontViolations: [],
      pairViolations: [],
      score: 0,
      seats: emptySeats,
      signature,
      tooMany: false,
    };
  }

  if (students.length > seatCount) {
    return {
      emptyRoster: false,
      frontViolations: [],
      pairViolations: [],
      score: Number.POSITIVE_INFINITY,
      seats: emptySeats,
      signature,
      tooMany: true,
    };
  }

  const allSeatIndexes = Array.from({ length: seatCount }, (_, index) => index);
  const frontSeatIndexes = allSeatIndexes.filter(
    (index) => getSeatPosition(index, columns).row < frontRows
  );
  const frontNameSet = new Set(frontNames.map(normalizeName));
  const attempts = Math.max(500, Math.min(2200, students.length * 90 + pairs.length * 160));
  let bestSeats = emptySeats;
  let bestEvaluation: SeatingEvaluation = {
    frontViolations: [],
    pairViolations: [],
    score: Number.POSITIVE_INFINITY,
  };

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const seats = Array.from<string | null>({ length: seatCount }).fill(null);
    const shuffledFrontSeats = shuffleArray(frontSeatIndexes);
    const shuffledFrontStudents = shuffleArray(
      frontNames.filter((name) =>
        students.some((student) => normalizeName(student) === normalizeName(name))
      )
    );
    const forcedFrontStudents = shuffledFrontStudents.slice(
      0,
      shuffledFrontSeats.length
    );
    const overflowFrontStudents = shuffledFrontStudents.slice(
      shuffledFrontSeats.length
    );

    forcedFrontStudents.forEach((student, index) => {
      seats[shuffledFrontSeats[index]] = student;
    });

    const remainingStudents = shuffleArray([
      ...overflowFrontStudents,
      ...students.filter((student) => !frontNameSet.has(normalizeName(student))),
    ]);
    const remainingSeats = shuffleArray(
      allSeatIndexes.filter((index) => seats[index] === null)
    );

    remainingStudents.forEach((student, index) => {
      seats[remainingSeats[index]] = student;
    });

    const evaluation = evaluateSeats({
      columns,
      frontNames,
      frontRows,
      pairs,
      seats,
    });

    if (evaluation.score < bestEvaluation.score) {
      bestEvaluation = evaluation;
      bestSeats = seats;
    }

    if (evaluation.score === 0) {
      break;
    }
  }

  return {
    emptyRoster: false,
    ...bestEvaluation,
    seats: bestSeats,
    signature,
    tooMany: false,
  };
}

function createDefaultChart() {
  const students = parseNameList(DEFAULT_STUDENTS);
  const rows = Number(DEFAULT_ROWS);
  const columns = Number(DEFAULT_COLUMNS);
  const frontRows = Number(DEFAULT_FRONT_ROWS);
  const frontMatch = matchRosterNames(
    parseNameList(DEFAULT_FRONT_STUDENTS),
    students
  );
  const pairParse = parseSeparatePairs(DEFAULT_SEPARATE_PAIRS, students);
  const signature = createSignature({
    columns,
    frontList: DEFAULT_FRONT_STUDENTS,
    frontRows,
    pairList: DEFAULT_SEPARATE_PAIRS,
    rows,
    students,
  });

  return buildSeatingChart({
    columns,
    frontNames: frontMatch.matched,
    frontRows,
    pairs: pairParse.pairs,
    rows,
    signature,
    students,
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function ClassroomSeatingChartGeneratorPage() {
  const t = useTranslations(
    "tools.categories.generator.tools.classroom_seating_chart_generator"
  );
  const useCases = asList<TextBlock>(t.raw("use_cases.items"));
  const constraintGuides = asList<ConstraintGuide>(
    t.raw("constraint_guide.items")
  );
  const faqs = asList<FaqItem>(t.raw("faq.items"));

  const [studentList, setStudentList] = useState(DEFAULT_STUDENTS);
  const [rowInput, setRowInput] = useState(DEFAULT_ROWS);
  const [columnInput, setColumnInput] = useState(DEFAULT_COLUMNS);
  const [frontRowsInput, setFrontRowsInput] = useState(DEFAULT_FRONT_ROWS);
  const [frontStudentList, setFrontStudentList] = useState(
    DEFAULT_FRONT_STUDENTS
  );
  const [separatePairList, setSeparatePairList] = useState(
    DEFAULT_SEPARATE_PAIRS
  );
  const [chart, setChart] = useState<SeatingChart>(() => createDefaultChart());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle"
  );

  const students = useMemo(() => parseNameList(studentList), [studentList]);
  const rowCount = parseGridSize(rowInput, Number(DEFAULT_ROWS), MAX_ROWS);
  const columnCount = parseGridSize(
    columnInput,
    Number(DEFAULT_COLUMNS),
    MAX_COLUMNS
  );
  const frontRowsCount = Math.min(
    rowCount,
    parseGridSize(frontRowsInput, Number(DEFAULT_FRONT_ROWS), rowCount)
  );
  const seatCount = rowCount * columnCount;
  const emptySeatCount = Math.max(0, seatCount - students.length);
  const frontMatch = useMemo(
    () => matchRosterNames(parseNameList(frontStudentList), students),
    [frontStudentList, students]
  );
  const pairParse = useMemo(
    () => parseSeparatePairs(separatePairList, students),
    [separatePairList, students]
  );
  const inputSignature = useMemo(
    () =>
      createSignature({
        columns: columnCount,
        frontList: frontStudentList,
        frontRows: frontRowsCount,
        pairList: separatePairList,
        rows: rowCount,
        students,
      }),
    [
      columnCount,
      frontRowsCount,
      frontStudentList,
      rowCount,
      separatePairList,
      students,
    ]
  );
  const chartIsStale = chart.signature !== inputSignature;
  const unresolvedCount =
    chart.frontViolations.length + chart.pairViolations.length;

  function generateChart() {
    setChart(
      buildSeatingChart({
        columns: columnCount,
        frontNames: frontMatch.matched,
        frontRows: frontRowsCount,
        pairs: pairParse.pairs,
        rows: rowCount,
        signature: inputSignature,
        students,
      })
    );
    setCopyStatus("idle");
  }

  function resetTool() {
    setStudentList(DEFAULT_STUDENTS);
    setRowInput(DEFAULT_ROWS);
    setColumnInput(DEFAULT_COLUMNS);
    setFrontRowsInput(DEFAULT_FRONT_ROWS);
    setFrontStudentList(DEFAULT_FRONT_STUDENTS);
    setSeparatePairList(DEFAULT_SEPARATE_PAIRS);
    setChart(createDefaultChart());
    setCopyStatus("idle");
  }

  function swapSeats(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || chart.seats.length !== seatCount) {
      return;
    }

    setChart((currentChart) => {
      const nextSeats = [...currentChart.seats];
      [nextSeats[fromIndex], nextSeats[toIndex]] = [
        nextSeats[toIndex],
        nextSeats[fromIndex],
      ];
      const evaluation = evaluateSeats({
        columns: columnCount,
        frontNames: frontMatch.matched,
        frontRows: frontRowsCount,
        pairs: pairParse.pairs,
        seats: nextSeats,
      });

      return {
        ...currentChart,
        ...evaluation,
        seats: nextSeats,
        signature: inputSignature,
      };
    });
  }

  function getChartText() {
    const lines = [t("copy_title"), t("front_of_room")];

    for (let row = 0; row < rowCount; row += 1) {
      const seats = chart.seats
        .slice(row * columnCount, row * columnCount + columnCount)
        .map((student) => student ?? t("empty_seat_short"))
        .join(" | ");

      lines.push(`${t("row_label", { row: row + 1 })}: ${seats}`);
    }

    return lines.join("\n");
  }

  async function copyChart() {
    try {
      await navigator.clipboard.writeText(getChartText());
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  function printChart() {
    const rowsHtml = Array.from({ length: rowCount }, (_, row) => {
      const cells = chart.seats
        .slice(row * columnCount, row * columnCount + columnCount)
        .map((student) => {
          return `<td>${escapeHtml(student ?? t("empty_seat_short"))}</td>`;
        })
        .join("");

      return `<tr><th>${escapeHtml(t("row_label", { row: row + 1 }))}</th>${cells}</tr>`;
    }).join("");
    const printWindow = window.open("", "_blank", "width=960,height=720");

    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`<!doctype html>
<html>
<head>
  <title>${escapeHtml(t("print_title"))}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
    h1 { font-size: 22px; margin: 0 0 8px; }
    .front { border: 1px solid #111827; padding: 8px; text-align: center; margin: 16px 0; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th, td { border: 1px solid #9ca3af; padding: 12px 8px; text-align: center; min-height: 48px; }
    th { width: 70px; background: #f3f4f6; }
    td { font-size: 14px; }
    .meta { color: #4b5563; font-size: 13px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(t("print_title"))}</h1>
  <div class="meta">${escapeHtml(
    t("print_meta", {
      columns: columnCount,
      rows: rowCount,
      students: students.length,
    })
  )}</div>
  <div class="front">${escapeHtml(t("front_of_room"))}</div>
  <table><tbody>${rowsHtml}</tbody></table>
</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => printWindow.print(), 100);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
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
              <Users className="size-5" />
              {t("tool_title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <label className="space-y-2">
              <span className="text-sm font-medium">{t("roster_label")}</span>
              <Textarea
                value={studentList}
                onChange={(event) => setStudentList(event.target.value)}
                placeholder={t("roster_placeholder")}
                className="min-h-48 resize-y"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-medium">{t("rows_label")}</span>
                <Input
                  type="number"
                  min="1"
                  max={MAX_ROWS}
                  value={rowInput}
                  onChange={(event) => setRowInput(event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  {t("columns_label")}
                </span>
                <Input
                  type="number"
                  min="1"
                  max={MAX_COLUMNS}
                  value={columnInput}
                  onChange={(event) => setColumnInput(event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">
                  {t("front_rows_label")}
                </span>
                <Input
                  type="number"
                  min="1"
                  max={rowCount}
                  value={frontRowsInput}
                  onChange={(event) => setFrontRowsInput(event.target.value)}
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium">
                {t("front_students_label")}
              </span>
              <Textarea
                value={frontStudentList}
                onChange={(event) => setFrontStudentList(event.target.value)}
                placeholder={t("front_students_placeholder")}
                className="min-h-24 resize-y"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">
                {t("separate_pairs_label")}
              </span>
              <Textarea
                value={separatePairList}
                onChange={(event) => setSeparatePairList(event.target.value)}
                placeholder={t("separate_pairs_placeholder")}
                className="min-h-24 resize-y"
              />
            </label>

            <Alert>
              <ListChecks className="size-4" />
              <AlertTitle>{t("privacy_title")}</AlertTitle>
              <AlertDescription>{t("privacy_text")}</AlertDescription>
            </Alert>

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={generateChart}>
                <Wand2 className="size-4" />
                {t("generate")}
              </Button>
              <Button type="button" variant="outline" onClick={generateChart}>
                <Shuffle className="size-4" />
                {t("shuffle")}
              </Button>
              <Button type="button" variant="outline" onClick={resetTool}>
                <RefreshCcw className="size-4" />
                {t("reset")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-primary/25">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Grid3X3 className="size-5" />
                  {t("result_title")}
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {t("students_count")}: {students.length}
                  </Badge>
                  <Badge variant="secondary">
                    {t("seats_count")}: {seatCount}
                  </Badge>
                  <Badge variant="outline">
                    {t("empty_count")}: {emptySeatCount}
                  </Badge>
                  <Badge
                    variant={unresolvedCount > 0 ? "destructive" : "outline"}
                  >
                    {t("unresolved_count")}: {unresolvedCount}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {chartIsStale && (
                <Alert>
                  <AlertCircle className="size-4" />
                  <AlertTitle>{t("chart_stale_title")}</AlertTitle>
                  <AlertDescription>{t("chart_stale_text")}</AlertDescription>
                </Alert>
              )}

              {(chart.tooMany || chart.emptyRoster) && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>{t("check_inputs")}</AlertTitle>
                  <AlertDescription>
                    {chart.tooMany
                      ? t("too_many_students", {
                          seats: seatCount,
                          students: students.length,
                        })
                      : t("empty_roster")}
                  </AlertDescription>
                </Alert>
              )}

              {(frontMatch.ignored.length > 0 ||
                pairParse.ignoredLines.length > 0) && (
                <Alert>
                  <AlertCircle className="size-4" />
                  <AlertTitle>{t("ignored_constraints_title")}</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc space-y-1 pl-4">
                      {frontMatch.ignored.length > 0 && (
                        <li>
                          {t("ignored_front_names", {
                            names: frontMatch.ignored.join(", "),
                          })}
                        </li>
                      )}
                      {pairParse.ignoredLines.length > 0 && (
                        <li>
                          {t("ignored_pair_lines", {
                            lines: pairParse.ignoredLines.join("; "),
                          })}
                        </li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {!chart.tooMany && !chart.emptyRoster && (
                <Alert variant={unresolvedCount > 0 ? "destructive" : "default"}>
                  <ArrowRightLeft className="size-4" />
                  <AlertTitle>{t("constraint_result_title")}</AlertTitle>
                  <AlertDescription>
                    {unresolvedCount === 0 ? (
                      t("all_constraints_clear")
                    ) : (
                      <ul className="list-disc space-y-1 pl-4">
                        {chart.frontViolations.length > 0 && (
                          <li>
                            {t("front_violations", {
                              names: chart.frontViolations.join(", "),
                            })}
                          </li>
                        )}
                        {chart.pairViolations.length > 0 && (
                          <li>
                            {t("pair_violations", {
                              pairs: chart.pairViolations
                                .map((pair) => `${pair.a} / ${pair.b}`)
                                .join(", "),
                            })}
                          </li>
                        )}
                      </ul>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="rounded-lg border bg-background p-3">
                <div className="mb-3 rounded-md border bg-muted/60 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("front_of_room")}
                </div>
                <div className="overflow-x-auto">
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${columnCount}, minmax(76px, 1fr))`,
                      minWidth: `${columnCount * 86}px`,
                    }}
                  >
                    {Array.from({ length: seatCount }, (_, index) => {
                      const position = getSeatPosition(index, columnCount);
                      const student = chart.seats[index] ?? null;
                      const isFrontSeat = position.row < frontRowsCount;

                      return (
                        <button
                          key={index}
                          type="button"
                          draggable={Boolean(student)}
                          onDragStart={() => setDraggedIndex(index)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => {
                            if (draggedIndex !== null) {
                              swapSeats(draggedIndex, index);
                            }
                            setDraggedIndex(null);
                          }}
                          onDragEnd={() => setDraggedIndex(null)}
                          className={cn(
                            "min-h-20 rounded-lg border p-2 text-left transition-colors",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isFrontSeat ? "bg-primary/5" : "bg-muted/20",
                            student
                              ? "cursor-move hover:border-primary"
                              : "cursor-default border-dashed text-muted-foreground"
                          )}
                          aria-label={t("seat_label", {
                            col: position.column + 1,
                            row: position.row + 1,
                          })}
                        >
                          <span className="block text-[11px] font-medium text-muted-foreground">
                            {t("seat_label", {
                              col: position.column + 1,
                              row: position.row + 1,
                            })}
                          </span>
                          <span className="mt-2 block break-words text-sm font-semibold">
                            {student ?? t("empty_seat")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={printChart}
                  disabled={chart.tooMany || chart.emptyRoster}
                >
                  <Printer className="size-4" />
                  {t("print")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyChart}
                  disabled={chart.tooMany || chart.emptyRoster}
                >
                  <Clipboard className="size-4" />
                  {copyStatus === "copied"
                    ? t("copied")
                    : copyStatus === "failed"
                      ? t("copy_failed")
                      : t("copy")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("quick_notes_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <p>{t("quick_note_front")}</p>
              <p>{t("quick_note_pairs")}</p>
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
          <h2 className="text-2xl font-bold">{t("constraint_guide.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("constraint_guide.description")}
          </p>
        </div>
        <div className="mt-6 overflow-hidden rounded-lg border">
          <div className="grid min-w-[760px] grid-cols-[1fr_1.2fr_1.8fr] bg-muted px-4 py-3 text-sm font-medium">
            <div>{t("constraint_guide.type")}</div>
            <div>{t("constraint_guide.entry")}</div>
            <div>{t("constraint_guide.behavior")}</div>
          </div>
          <div className="overflow-x-auto">
            {constraintGuides.map((item) => (
              <div
                key={item.type}
                className="grid min-w-[760px] grid-cols-[1fr_1.2fr_1.8fr] border-t px-4 py-3 text-sm"
              >
                <div className="font-medium">{item.type}</div>
                <div className="text-muted-foreground">{item.entry}</div>
                <div className="text-muted-foreground">{item.behavior}</div>
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
