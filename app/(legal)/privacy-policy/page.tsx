import { notFound } from "next/navigation";

const content = {
  zh: (
    <div className="prose prose-neutral max-w-none">
      <h1 className="text-3xl font-bold mb-6">隐私政策</h1>
      <p>欢迎使用 TinyToolFlare。我们承诺保护您的隐私和个人信息安全。</p>
      <h3>1. 信息收集</h3>
      <ul>
        <li>仅在必要时收集注册、使用、支付等信息</li>
        <li>不会主动收集超出服务所需范围的信息</li>
      </ul>
      <h3>2. 信息用途</h3>
      <ul>
        <li>用于账号管理、服务优化与安全保障</li>
        <li>符合法律法规的其他用途</li>
      </ul>
      <h3>3. 信息共享</h3>
      <ul>
        <li>仅在获得授权、符合法律或为实现服务功能时共享</li>
        <li>绝不出售您的个人信息</li>
      </ul>
      <h3>4. 信息安全</h3>
      <p>我们采用业界标准的安全措施，防止数据泄露、滥用或未授权访问。</p>
      <h3>5. 用户权利</h3>
      <p>您可随时申请访问、更正或删除您的个人信息。</p>
      <h3>6. 政策变更</h3>
      <p>如有更新，我们将在网站显著位置公示。</p>
      <h3>7. 联系我们</h3>
      <p>如有疑问，请联系 <a href="mailto:support@tinytoolflare.com">support@tinytoolflare.com</a>。</p>
    </div>
  ),
  en: (
    <div className="prose prose-neutral max-w-none">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p>Welcome to TinyToolFlare. We are committed to protecting your privacy and personal data security.</p>
      <h3>1. Information Collection</h3>
      <ul>
        <li>We only collect necessary info for registration, usage, and payment</li>
        <li>No data is collected beyond what is required for our services</li>
      </ul>
      <h3>2. Use of Information</h3>
      <ul>
        <li>For account management, service optimization, and security</li>
        <li>Other uses as required by law</li>
      </ul>
      <h3>3. Information Sharing</h3>
      <ul>
        <li>Shared only with your consent, as required by law, or to enable service features</li>
        <li>Your personal data is never sold</li>
      </ul>
      <h3>4. Data Security</h3>
      <p>We use industry-standard security measures to prevent data leaks, misuse, or unauthorized access.</p>
      <h3>5. Your Rights</h3>
      <p>You may request access, correction, or deletion of your personal data at any time.</p>
      <h3>6. Policy Changes</h3>
      <p>Updates will be posted prominently on our website.</p>
      <h3>7. Contact Us</h3>
      <p>If you have questions, contact <a href="mailto:support@tinytoolflare.com">support@tinytoolflare.com</a>.</p>
    </div>
  ),
};

export default function PrivacyPolicyPage({ params }: { params: { locale: string } }) {
  const lang = params?.locale === "en" ? "en" : "zh";
  if (!content[lang]) return notFound();
  return <div className="container py-12 max-w-2xl mx-auto">{content[lang]}</div>;
} 