"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  if (bmi < 18.5) return { label: t("bmi_status", { status: t("underweight", "偏瘦") }), color: "#60a5fa" };
  if (bmi < 25) return { label: t("bmi_status", { status: t("normal", "正常") }), color: "#22c55e" };
  if (bmi < 30) return { label: t("bmi_status", { status: t("overweight", "超重") }), color: "#facc15" };
  return { label: t("bmi_status", { status: t("obese", "肥胖") }), color: "#ef4444" };
}

export default function BMICalculatorPage() {
  const t = useTranslations("tools.categories.calculator.tools.bmi_calculator");
  const [tab, setTab] = useState("metric");
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState("male");
  // Metric
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(65);
  // US
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(7);
  const [weightLb, setWeightLb] = useState(160);
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

  // 健康体重区间
  const minWeight = tab === "metric"
    ? (18.5 * (heightCm / 100) ** 2).toFixed(1)
    : (18.5 * ((heightFt * 12 + heightIn) ** 2) / 703).toFixed(1);
  const maxWeight = tab === "metric"
    ? (25 * (heightCm / 100) ** 2).toFixed(1)
    : (25 * ((heightFt * 12 + heightIn) ** 2) / 703).toFixed(1);
  const healthyWeightStr = tab === "metric"
    ? t("healthy_weight", { height: `${heightCm}cm`, min: minWeight + "kg", max: maxWeight + "kg" })
    : t("healthy_weight", { height: `${heightFt}ft${heightIn}in`, min: minWeight + "lb", max: maxWeight + "lb" });


  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
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
                  <label className="block mb-1 font-medium">{t("age")}</label>
                  <Input type="number" min={2} max={120} value={age} onChange={e => setAge(Number(e.target.value))} onBlur={handleBlur} />
                </div>
                <div>
                  <label className="block mb-1 font-medium">{t("gender")}</label>
                  <RadioGroup value={gender} onValueChange={setGender} className="flex gap-6 mt-2">
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="male" id="male" />
                      <label htmlFor="male">{t("male")}</label>
                    </div>
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="female" id="female" />
                      <label htmlFor="female">{t("female")}</label>
                    </div>
                  </RadioGroup>
                </div>
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
                <div>
                  <label className="block mb-1 font-medium">{t("age")}</label>
                  <Input type="number" min={2} max={120} value={age} onChange={e => setAge(Number(e.target.value))} onBlur={handleBlur} />
                </div>
                <div>
                  <label className="block mb-1 font-medium">{t("gender")}</label>
                  <RadioGroup value={gender} onValueChange={setGender} className="flex gap-6 mt-2">
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="male" id="male_us" />
                      <label htmlFor="male_us">{t("male")}</label>
                    </div>
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="female" id="female_us" />
                      <label htmlFor="female_us">{t("female")}</label>
                    </div>
                  </RadioGroup>
                </div>
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
                <li>{t("bmi_prime", { prime: (bmi / 25).toFixed(2) })}</li>
                <li>{t("ponderal_index", {
                  pi: tab === "metric"
                    ? (weightKg / Math.pow(heightCm / 100, 3)).toFixed(1)
                    : (weightLb / Math.pow((heightFt * 12 + heightIn) * 0.0254, 3)).toFixed(1)
                })}</li>
              </ul>
            </div>
          )}
          <div className="mt-6">
            <Button variant="outline" className="border-primary text-primary">
              {t("share_image")}
            </Button>
          </div>
        </CardContent>
      </Card>
      <section className="mt-10 space-y-8">
        <div>
          <h2 className="text-xl font-bold mb-2">{t("what_is_bmi_title")}</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            BMI（Body Mass Index，身体质量指数）是国际上常用的衡量人体胖瘦程度以及健康风险的重要指标。它通过体重和身高的比例来评估个体的体重状况，适用于大多数成年人。BMI 计算简便，广泛用于流行病学调查和临床评估。
          </p>
          <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-1">
            <li>BMI 主要用于反映全身性脂肪含量，不能区分脂肪和肌肉。</li>
            <li>对于运动员、孕妇、老年人等特殊人群，BMI 仅供参考。</li>
            <li>BMI 过高或过低都可能增加慢性疾病风险，如心血管疾病、糖尿病等。</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">BMI 计算公式</h2>
          <div className="bg-muted rounded-lg p-4 mb-2">
            <div className="mb-2 font-medium">公制单位：</div>
            <div className="text-lg font-mono mb-2">
              <span>BMI = </span>
              <span className="inline-block align-middle">
                <svg width="120" height="32" viewBox="0 0 120 32">
                  <text x="0" y="18" fontSize="18">体重(kg)</text>
                  <line x1="0" y1="22" x2="70" y2="22" stroke="#333" strokeWidth="2" />
                  <text x="0" y="32" fontSize="18">身高(m)</text>
                  <text x="60" y="32" fontSize="16">²</text>
                </svg>
              </span>
            </div>
            <div className="mb-2 font-medium">美制单位：</div>
            <div className="text-lg font-mono">
              <span>BMI = </span>
              <span className="inline-block align-middle">
                <svg width="200" height="32" viewBox="0 0 200 32">
                  <text x="0" y="18" fontSize="18">体重(lb)</text>
                  <line x1="0" y1="22" x2="70" y2="22" stroke="#333" strokeWidth="2" />
                  <text x="0" y="32" fontSize="18">身高(in)</text>
                  <text x="60" y="32" fontSize="16">²</text>
                  <text x="90" y="18" fontSize="18">× 703</text>
                </svg>
              </span>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">BMI 计算结果仅供参考，具体健康状况请结合体脂率、腰围等指标综合判断。</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">成年人 BMI 标准</h2>
          <div className="overflow-x-auto">
            <table className="min-w-[340px] w-full border text-center text-sm bg-white rounded-lg shadow">
              <thead className="bg-muted">
                <tr>
                  <th className="py-2 px-3 border-b">分类</th>
                  <th className="py-2 px-3 border-b">BMI 范围 (kg/m²)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="py-2 px-3">偏瘦</td><td className="py-2 px-3">&lt; 18.5</td></tr>
                <tr><td className="py-2 px-3">正常</td><td className="py-2 px-3">18.5 - 24.9</td></tr>
                <tr><td className="py-2 px-3">超重</td><td className="py-2 px-3">25 - 29.9</td></tr>
                <tr><td className="py-2 px-3">肥胖</td><td className="py-2 px-3">≥ 30</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-muted-foreground text-xs mt-2">* 参考世界卫生组织（WHO）标准。部分亚洲国家将“正常”上限设为 23.9。</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">儿童青少年 BMI 标准</h2>
          <div className="overflow-x-auto">
            <table className="min-w-[340px] w-full border text-center text-sm bg-white rounded-lg shadow">
              <thead className="bg-muted">
                <tr>
                  <th className="py-2 px-3 border-b">年龄</th>
                  <th className="py-2 px-3 border-b">偏瘦</th>
                  <th className="py-2 px-3 border-b">正常</th>
                  <th className="py-2 px-3 border-b">超重</th>
                  <th className="py-2 px-3 border-b">肥胖</th>
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
          <p className="text-muted-foreground text-xs mt-2">* 参考中国卫生行业标准《WS/T 586-2018》。</p>
        </div>
      </section>
      <div className="mt-8 text-sm text-muted-foreground leading-relaxed">
        <p>{t("disclaimer")}</p>
      </div>
    </div>
  );
}
