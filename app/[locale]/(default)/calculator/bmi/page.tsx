"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import AntdScoreGauge from '@/components/blocks/AntdScoreGauge'

function calculateBMI_Metric(heightCm: number, weightKg: number) {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

function calculateBMI_US(heightFt: number, heightIn: number, weightLb: number) {
  const totalIn = heightFt * 12 + heightIn;
  return (weightLb / (totalIn * totalIn)) * 703;
}

function getBMIStatus(bmi: number, t: any) {
  // WHO国际标准
  if (bmi < 16.0) return { label: t("bmi_status", { status: t("severely_underweight", "重度偏瘦") }), color: "#3B82F6" };
  if (bmi < 18.5) return { label: t("bmi_status", { status: t("underweight", "偏瘦") }), color: "#60A5FA" };
  if (bmi < 25.0) return { label: t("bmi_status", { status: t("normal", "正常") }), color: "#22C55E" };
  if (bmi < 30.0) return { label: t("bmi_status", { status: t("overweight", "超重") }), color: "#FACC15" };
  if (bmi < 35.0) return { label: t("bmi_status", { status: t("obese_class_1", "肥胖I级") }), color: "#F97316" };
  if (bmi < 40.0) return { label: t("bmi_status", { status: t("obese_class_2", "肥胖II级") }), color: "#EF4444" };
  return { label: t("bmi_status", { status: t("obese_class_3", "肥胖III级") }), color: "#DC2626" };
}

export default function BMICalculatorPage() {
  const t = useTranslations("tools.categories.calculator.tools.bmi_calculator");
  const [tab, setTab] = useState("metric");
  // Metric
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(65);
  // US
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(7);
  const [weightLb, setWeightLb] = useState(140);
  // 结果
  const [bmi, setBmi] = useState<number | null>(null);

  // 初始渲染时自动计算一次
  useEffect(() => {
    autoCalculate(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 只在 onBlur 时计算
  function autoCalculate(nextTab = tab, nextVals?: any) {
    let result = 0;
    if ((nextTab || tab) === "metric") {
      result = calculateBMI_Metric(
        nextVals?.heightCm ?? heightCm,
        nextVals?.weightKg ?? weightKg
      );
    } else {
      result = calculateBMI_US(
        nextVals?.heightFt ?? heightFt,
        nextVals?.heightIn ?? heightIn,
        nextVals?.weightLb ?? weightLb
      );
    }
    setBmi(Number(result.toFixed(1)));
  }

  function handleBlur() {
    autoCalculate();
  }

  function handleTabChange(val: string) {
    setTab(val);
    setTimeout(() => autoCalculate(val), 0);
  }

  // 输入变更时只更新 state，不自动计算
  function handleInputChange(setter: any) {
    return (e: any) => {
      const v = Number(e.target.value);
      setter(v);
    };
  }

  const status = bmi ? getBMIStatus(bmi, t) : null;

  // 健康体重区间 - 使用WHO国际标准
  const minWeight = tab === "metric"
    ? (18.5 * (heightCm / 100) ** 2).toFixed(1)
    : (18.5 * ((heightFt * 12 + heightIn) ** 2) / 703).toFixed(1);
  const maxWeight = tab === "metric"
    ? (24.9 * (heightCm / 100) ** 2).toFixed(1)
    : (24.9 * ((heightFt * 12 + heightIn) ** 2) / 703).toFixed(1);
  const healthyWeightStr = tab === "metric"
    ? t("healthy_weight", { height: `${heightCm}cm`, min: minWeight + "kg", max: maxWeight + "kg" })
    : t("healthy_weight", { height: `${heightFt}ft${heightIn}in`, min: minWeight + "lb", max: maxWeight + "lb" });


  return (
    <div className="md:max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("input_info")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={handleTabChange} className="mb-4">
            <TabsList>
              <TabsTrigger value="metric">{t("metric")}</TabsTrigger>
              <TabsTrigger value="us">{t("us")}</TabsTrigger>
            </TabsList>
            <TabsContent value="metric">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block mb-1 font-medium">{t("height_cm")}</label>
                  <Input type="number" min={50} max={250} value={heightCm} onChange={handleInputChange(setHeightCm)} onBlur={handleBlur} />
                </div>
                <div>
                  <label className="block mb-1 font-medium">{t("weight_kg")}</label>
                  <Input type="number" min={10} max={300} value={weightKg} onChange={handleInputChange(setWeightKg)} onBlur={handleBlur} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="us">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block mb-1 font-medium">{t("height_ft")}</label>
                    <Input type="number" min={2} max={8} value={heightFt} onChange={handleInputChange(setHeightFt)} onBlur={handleBlur} />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 font-medium">{t("height_in")}</label>
                    <Input type="number" min={0} max={11} value={heightIn} onChange={handleInputChange(setHeightIn)} onBlur={handleBlur} />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-medium">{t("weight_lb")}</label>
                  <Input type="number" min={20} max={660} value={weightLb} onChange={handleInputChange(setWeightLb)} onBlur={handleBlur} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="mt-4 text-muted-foreground text-sm">{t("input_tip")}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t("result")}</CardTitle>
        </CardHeader>
        <CardContent>
          {bmi === null ? (
            <div className="text-muted-foreground">{t("input_tip")}</div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold mb-2">{bmi}</div>
                <div className="text-lg font-semibold mb-2" style={{ color: status?.color }}>{status?.label}</div>
                <AntdScoreGauge value={bmi} max={40} />
              </div>
              <ul className="text-base space-y-1">
                <li>{t("healthy_range")}</li>
                <li>{healthyWeightStr}</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      <section className="mt-10 space-y-8">
        <div>
          <h2 className="text-xl font-bold mb-2">{t("what_is_bmi_title")}</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            {t("bmi_explanation")}
          </p>
          <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-1">
            <li>{t("bmi_limitations.0")}</li>
            <li>{t("bmi_limitations.1")}</li>
            <li>{t("bmi_limitations.2")}</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">{t("formula_title")}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 公制公式 */}
            <div className="bg-muted rounded-lg p-6 flex flex-col justify-center">
              <h3 className="font-semibold text-lg mb-6 text-center">{t("formula_metric")}</h3>
              <div className="flex justify-center items-center mb-6 min-h-[120px]">
                <div className="text-2xl font-mono bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-blue-600 font-bold">BMI</span>
                    <span className="mx-2">=</span>
                    <div className="inline-flex flex-col items-center">
                      <div className="text-center">{t("formula_weight_kg")}</div>
                      <div className="border-t-2 border-gray-800 w-full my-1"></div>
                      <div className="text-center">{t("formula_height_m")}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground text-center">
                <p className="mb-2">{t("formula_example_metric")}</p>
                <div className="bg-white rounded p-3 font-mono text-xs">
                  {t("formula_calculation_metric")}
                </div>
              </div>
            </div>

            {/* 英制公式 */}
            <div className="bg-muted rounded-lg p-6 flex flex-col justify-center">
              <h3 className="font-semibold text-lg mb-6 text-center">{t("formula_us")}</h3>
              <div className="flex justify-center items-center mb-6 min-h-[120px]">
                <div className="text-2xl font-mono bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-blue-600 font-bold">BMI</span>
                    <span className="mx-2">=</span>
                    <div className="inline-flex flex-col items-center">
                      <div className="text-center">{t("formula_weight_lb")}</div>
                      <div className="border-t-2 border-gray-800 w-full my-1"></div>
                      <div className="text-center">{t("formula_height_in")}</div>
                    </div>
                    <span className="mx-2">{t("formula_multiply")}</span>
                    <span className="text-green-600">{t("formula_conversion_factor")}</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground text-center">
                <p className="mb-2">{t("formula_example_us")}</p>
                <div className="bg-white rounded p-3 font-mono text-xs">
                  {t("formula_calculation_us")}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">{t("formula_note_title")}</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• {t("formula_note_1")}</li>
              <li>• {t("formula_note_2")}</li>
              <li>• {t("formula_note_3")}</li>
            </ul>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">{t("adult_standards_title")}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-[340px] w-full border text-center text-sm bg-white rounded-lg shadow">
              <thead className="bg-muted">
                <tr>
                  <th className="py-2 px-3 border-b">{t("standards_table.category")}</th>
                  <th className="py-2 px-3 border-b">{t("standards_table.bmi_range")}</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="py-2 px-3">{t("standards_table.severely_underweight")}</td><td className="py-2 px-3">&lt; 16.0</td></tr>
                <tr><td className="py-2 px-3">{t("standards_table.underweight")}</td><td className="py-2 px-3">16.0 - 18.4</td></tr>
                <tr><td className="py-2 px-3">{t("standards_table.normal")}</td><td className="py-2 px-3">18.5 - 24.9</td></tr>
                <tr><td className="py-2 px-3">{t("standards_table.overweight")}</td><td className="py-2 px-3">25.0 - 29.9</td></tr>
                <tr><td className="py-2 px-3">{t("standards_table.obese_class_1")}</td><td className="py-2 px-3">30.0 - 34.9</td></tr>
                <tr><td className="py-2 px-3">{t("standards_table.obese_class_2")}</td><td className="py-2 px-3">35.0 - 39.9</td></tr>
                <tr><td className="py-2 px-3">{t("standards_table.obese_class_3")}</td><td className="py-2 px-3">≥ 40.0</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-muted-foreground text-xs mt-2">{t("adult_standards_note")}</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">{t("child_standards_title")}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-[340px] w-full border text-center text-sm bg-white rounded-lg shadow">
              <thead className="bg-muted">
                <tr>
                  <th className="py-2 px-3 border-b">{t("standards_table.age")}</th>
                  <th className="py-2 px-3 border-b">{t("standards_table.underweight")}</th>
                  <th className="py-2 px-3 border-b">{t("standards_table.normal")}</th>
                  <th className="py-2 px-3 border-b">{t("standards_table.overweight")}</th>
                  <th className="py-2 px-3 border-b">{t("standards_table.obese")}</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="py-2 px-3">7-9</td><td className="py-2 px-3">&lt; 14.5</td><td className="py-2 px-3">14.5-18.0</td><td className="py-2 px-3">18.1-20.0</td><td className="py-2 px-3">≥ 20.1</td></tr>
                <tr><td className="py-2 px-3">10-12</td><td className="py-2 px-3">&lt; 15.5</td><td className="py-2 px-3">15.5-19.0</td><td className="py-2 px-3">19.1-22.0</td><td className="py-2 px-3">≥ 22.1</td></tr>
                <tr><td className="py-2 px-3">13-15</td><td className="py-2 px-3">&lt; 16.5</td><td className="py-2 px-3">16.5-21.0</td><td className="py-2 px-3">21.1-24.0</td><td className="py-2 px-3">≥ 24.1</td></tr>
                <tr><td className="py-2 px-3">16-18</td><td className="py-2 px-3">&lt; 17.5</td><td className="py-2 px-3">17.5-23.0</td><td className="py-2 px-3">23.1-26.0</td><td className="py-2 px-3">≥ 26.1</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-muted-foreground text-xs mt-2">{t("child_standards_note")}</p>
        </div>
      </section>
      <div className="mt-8 text-sm text-muted-foreground leading-relaxed">
        <p>{t("disclaimer")}</p>
      </div>
    </div>
  );
}
