import LegalPage from "@/components/legal/legal-page";

export default function TermsOfServicePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return <LegalPage locale={locale} type="terms-of-service" />;
}
