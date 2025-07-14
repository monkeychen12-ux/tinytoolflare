"use client";

import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";

export default function GoogleAnalytics() {
  const analyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  window.__TEST__ = {
    analyticsId,
    NODE_ENV: process.env.NODE_ENV,
  };
  console.log("analyticsId", analyticsId, process.env.NODE_ENV );
  if (process.env.NODE_ENV !== "production") {
    return null;
  }
  if (!analyticsId) {
    return null;
  }

  return <NextGoogleAnalytics gaId={analyticsId} />;
}
