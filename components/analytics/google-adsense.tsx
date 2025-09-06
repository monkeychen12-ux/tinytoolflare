"use client";

import Script from "next/script";

export default function GoogleAdSense() {
  const adSenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;
  
  if (process.env.NODE_ENV !== "production") {
    return null;
  }
  
  if (!adSenseId) {
    return null;
  }
  return (
    <>
      {/* AdSense 自动广告脚本 */}
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </>
  );
}
