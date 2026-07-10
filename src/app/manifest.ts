import type { MetadataRoute } from "next";
import {
  APP_DESCRIPTION_KO,
  APP_NAME,
  APP_SHORT_NAME,
} from "@/lib/appBranding";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_SHORT_NAME,
    description: APP_DESCRIPTION_KO,
    start_url: "https://english-study-navy.vercel.app/",
    display: "standalone",
    theme_color: "#2563eb",
    background_color: "#ffffff",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
