import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Icon from "@/components/icon";
import { useTranslations } from "next-intl";

interface ToolCardProps {
  icon: string; // Remix Icon 名称
  title: string;
  description: string;
  link?: string;
}

export default function ToolCard({ icon, title, description, link }: ToolCardProps) {
  const t = useTranslations();
  const openText = t("tools.open");

  return (
    <Card className="flex flex-col h-full rounded-2xl border border-gray-200 bg-muted/50 p-0 relative group transition duration-200 hover:border-primary hover:shadow-md">
      <CardHeader className="flex flex-col items-start gap-2 pb-0">
        <div className="text-4xl font-bold text-primary mb-2">
          <Icon name={icon} />
        </div>
        <CardTitle className="text-lg font-bold mb-1">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 text-muted-foreground text-base pb-0">
        <CardDescription className="text-base text-muted-foreground leading-relaxed">{description}</CardDescription>
      </CardContent>
      <CardFooter className="flex items-center pt-4">
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium flex items-center gap-1 transition-colors cursor-pointer group/open hover:text-primary hover:font-semibold"
          >
            {openText}
            <span className="ml-1 transition-transform group-hover/open:translate-x-1 group-hover/open:text-primary">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 4L12 9L7 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </a>
        )}
      </CardFooter>
    </Card>
  );
} 