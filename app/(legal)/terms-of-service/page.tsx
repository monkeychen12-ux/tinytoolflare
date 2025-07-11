import { notFound } from "next/navigation";

const content = {
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
      <h3>6. 法律适用</h3>
      <p>本条款适用中华人民共和国法律，争议提交平台所在地法院。</p>
      <h3>7. 条款变更</h3>
      <p>平台有权随时更新条款，更新后在网站公示。</p>
    </div>
  ),
  en: (
    <div className="prose prose-neutral max-w-none">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p>Welcome to TinyToolFlare. Please read and agree to the following terms before using our services.</p>
      <h3>1. Service Content</h3>
      <p>This platform provides various online tools, subject to the actual offerings on the site.</p>
      <h3>2. User Obligations</h3>
      <ul>
        <li>Comply with laws and platform rules</li>
        <li>No illegal, infringing, or malicious activities</li>
        <li>Keep your account secure; you are responsible for losses due to leakage</li>
      </ul>
      <h3>3. Service Changes & Termination</h3>
      <p>We may adjust, suspend, or terminate services with prior notice.</p>
      <h3>4. Disclaimer</h3>
      <ul>
        <li>Tool results are for reference only, not legal or professional advice</li>
        <li>We are not liable for losses caused by force majeure or third parties</li>
      </ul>
      <h3>5. Intellectual Property</h3>
      <p>All content belongs to TinyToolFlare or rights holders. Unauthorized use is prohibited.</p>
      <h3>6. Governing Law</h3>
      <p>These terms are governed by the laws of China. Disputes are submitted to the court where the platform is located.</p>
      <h3>7. Terms Update</h3>
      <p>We may update these terms at any time. Updates will be posted on the website.</p>
    </div>
  ),
};

export default function TermsOfServicePage({ params }: { params: { locale: string } }) {
  const lang = params?.locale === "en" ? "en" : "zh";
  if (!content[lang]) return notFound();
  return <div className="container py-12 max-w-2xl mx-auto">{content[lang]}</div>;
} 