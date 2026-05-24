import { notFound } from "next/navigation";

type LegalPageType = "privacy-policy" | "terms-of-service";
type LegalLocale = "en" | "zh";

const privacyPolicyContent = {
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
      <p>
        如有疑问，请联系{" "}
        <a href="mailto:support@tinytoolflare.com">
          support@tinytoolflare.com
        </a>
        。
      </p>
    </div>
  ),
  en: (
    <div className="prose prose-neutral max-w-none">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p>
        Welcome to TinyToolFlare. We are committed to protecting your privacy
        and personal data security.
      </p>
      <h3>1. Information Collection</h3>
      <ul>
        <li>
          We only collect necessary info for registration, usage, and payment
        </li>
        <li>No data is collected beyond what is required for our services</li>
      </ul>
      <h3>2. Use of Information</h3>
      <ul>
        <li>For account management, service optimization, and security</li>
        <li>Other uses as required by law</li>
      </ul>
      <h3>3. Information Sharing</h3>
      <ul>
        <li>
          Shared only with your consent, as required by law, or to enable
          service features
        </li>
        <li>Your personal data is never sold</li>
      </ul>
      <h3>4. Data Security</h3>
      <p>
        We use industry-standard security measures to prevent data leaks,
        misuse, or unauthorized access.
      </p>
      <h3>5. Your Rights</h3>
      <p>
        You may request access, correction, or deletion of your personal data at
        any time.
      </p>
      <h3>6. Policy Changes</h3>
      <p>Updates will be posted prominently on our website.</p>
      <h3>7. Contact Us</h3>
      <p>
        If you have questions, contact{" "}
        <a href="mailto:support@tinytoolflare.com">
          support@tinytoolflare.com
        </a>
        .
      </p>
    </div>
  ),
};

const termsOfServiceContent = {
  zh: (
    <div className="prose prose-neutral max-w-none">
      <h1 className="text-3xl font-bold mb-6">服务条款</h1>
      <p>欢迎使用 TinyToolFlare。请在使用前仔细阅读并同意以下条款。</p>
      <h3>1. 服务内容</h3>
      <p>本平台提供多种在线工具，具体以实际页面为准。</p>
      <h3>2. 用户义务</h3>
      <ul>
        <li>遵守法律法规及平台规则</li>
        <li>不得利用平台从事违法、侵权、恶意等行为</li>
        <li>妥善保管账号，因泄露造成的损失由用户承担</li>
      </ul>
      <h3>3. 服务变更与终止</h3>
      <p>平台有权调整、暂停或终止服务，并提前公告。</p>
      <h3>4. 免责声明</h3>
      <ul>
        <li>工具结果仅供参考，不构成法律或专业建议</li>
        <li>因不可抗力或第三方原因导致的损失，平台不承担责任</li>
      </ul>
      <h3>5. 知识产权</h3>
      <p>平台内容归 TinyToolFlare 或权利人所有，未经授权不得使用。</p>
      <h3>6. 条款变更</h3>
      <p>平台有权随时更新条款，更新后在网站公示。</p>
    </div>
  ),
  en: (
    <div className="prose prose-neutral max-w-none">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p>
        Welcome to TinyToolFlare. Please read and agree to the following terms
        before using our services.
      </p>
      <h3>1. Service Content</h3>
      <p>
        This platform provides various online tools, subject to the actual
        offerings on the site.
      </p>
      <h3>2. User Obligations</h3>
      <ul>
        <li>Comply with laws and platform rules</li>
        <li>No illegal, infringing, or malicious activities</li>
        <li>
          Keep your account secure; you are responsible for losses due to
          leakage
        </li>
      </ul>
      <h3>3. Service Changes & Termination</h3>
      <p>We may adjust, suspend, or terminate services with prior notice.</p>
      <h3>4. Disclaimer</h3>
      <ul>
        <li>
          Tool results are for reference only, not legal or professional advice
        </li>
        <li>
          We are not liable for losses caused by force majeure or third parties
        </li>
      </ul>
      <h3>5. Intellectual Property</h3>
      <p>
        All content belongs to TinyToolFlare or rights holders. Unauthorized use
        is prohibited.
      </p>
      <h3>6. Terms Update</h3>
      <p>We may update these terms at any time. Updates will be posted on the website.</p>
    </div>
  ),
};

const content = {
  "privacy-policy": privacyPolicyContent,
  "terms-of-service": termsOfServiceContent,
};

export default function LegalPage({
  locale,
  type,
}: {
  locale?: string;
  type: LegalPageType;
}) {
  const lang: LegalLocale = locale === "zh" ? "zh" : "en";
  const pageContent = content[type][lang];

  if (!pageContent) {
    return notFound();
  }

  return <div className="container py-12 max-w-2xl mx-auto">{pageContent}</div>;
}
