import { useTranslations } from "next-intl";

export default function Head() {
  // 这里不能用 hook，直接写静态内容，后续可用 next-intl/server 动态实现
  return (
    <>
      <title>BMI 计算器 | TinyToolFlare</title>
      <meta name="description" content="在线 BMI 计算器，支持公制/美制单位，自动计算 BMI 指数、健康区间、体重建议。" />
      <meta name="keywords" content="BMI, 体重指数, 健康, 计算器, 在线工具, TinyToolFlare" />
      <meta property="og:title" content="BMI 计算器 | TinyToolFlare" />
      <meta property="og:description" content="在线 BMI 计算器，支持公制/美制单位，自动计算 BMI 指数、健康区间、体重建议。" />
      <meta property="og:type" content="website" />
    </>
  );
} 