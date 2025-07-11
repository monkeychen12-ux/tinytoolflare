import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import HappyUsers from "./happy-users";
import { Hero as HeroType } from "@/types/blocks/hero";
import Icon from "@/components/icon";
import Link from "next/link";

export default function Hero({ hero }: { hero: HeroType }) {
  if (hero.disabled) {
    return null;
  }

  const highlightText = hero.highlight_text;
  let texts = null;
  if (highlightText && hero.title) {
    texts = hero.title.split(highlightText, 2);
  }

  return (
    <section className="py-12 bg-primary/5">
      <div className="container flex flex-col-reverse md:flex-row items-center gap-12">
        {/* 左侧文案区 */}
        <div className="flex-1 w-full text-center md:text-left">
          {hero.announcement && (
            <a
              href={hero.announcement.url}
              className="mx-auto mb-3 inline-flex items-center gap-3 rounded-full border px-2 py-1 text-xs"
            >
              {hero.announcement.label && <Badge>{hero.announcement.label}</Badge>}
              {hero.announcement.title}
            </a>
          )}

          {texts && texts.length > 1 ? (
            <h1 className="mx-auto mb-3 mt-4 max-w-3xl text-balance text-4xl font-bold lg:mb-7 lg:text-7xl relative inline-block">
              {texts[0]}
              <span className="relative z-10">
                <span className="bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent">
                  {highlightText}
                </span>
                {/* 蓝色手绘高亮线条 */}
                <svg className="absolute left-0 bottom-0 w-full h-3 z-0" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 10 Q150 2 298 10" stroke="#3B82F6" strokeWidth="6" strokeLinecap="round" fill="none" />
                </svg>
              </span>
              {texts[1]}
            </h1>
          ) : (
            <h1 className="mx-auto mb-3 mt-4 max-w-3xl text-balance text-4xl font-bold lg:mb-7 lg:text-7xl">
              {hero.title}
            </h1>
          )}

          <p className="mx-auto max-w-3xl text-muted-foreground lg:text-xl" dangerouslySetInnerHTML={{ __html: hero.description || "" }} />
          {hero.buttons && (
            <div className="mt-8 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
              {hero.buttons.map((item, i) => (
                <Link key={i} href={item.url || "#"} target={item.target || ""} className="flex items-center">
                  <Button className="rounded-full px-8 py-6 text-lg font-semibold shadow-md" size="lg" variant={item.variant || "default"}>
                    {item.title}
                    {item.icon && <Icon name={item.icon} className="ml-1" />}
                  </Button>
                </Link>
              ))}
            </div>
          )}
          {hero.tip && <p className="mt-8 text-md text-muted-foreground">{hero.tip}</p>}
          {hero.show_happy_users && <HappyUsers />}
        </div>
        {/* 右侧插画区 */}
        <div className="flex-1 w-full flex justify-center items-center">
          {/* SVG 插画占位，可替换为更精美插画 */}
          <svg width="320" height="260" viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="160" cy="250" rx="120" ry="10" fill="#E0E7FF" />
            <rect x="80" y="120" width="120" height="60" rx="8" fill="#3B82F6" />
            <rect x="120" y="80" width="80" height="40" rx="8" fill="#6366F1" />
            <circle cx="200" cy="60" r="20" fill="#3B82F6" />
            <rect x="180" y="180" width="40" height="40" rx="12" fill="#6366F1" />
            {/* 猫咪占位 */}
            <ellipse cx="100" cy="240" rx="30" ry="8" fill="#6366F1" />
            <circle cx="90" cy="235" r="10" fill="#3B82F6" />
            <ellipse cx="110" cy="238" rx="8" ry="5" fill="#3B82F6" />
          </svg>
        </div>
      </div>
    </section>
  );
}
