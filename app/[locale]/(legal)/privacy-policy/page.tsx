import LegalPage from "@/components/legal/legal-page";

export default function PrivacyPolicyPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return <LegalPage locale={locale} type="privacy-policy" />;
}
