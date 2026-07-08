import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "English Learning",
    short_name: "English",
    description: "영어 단어를 학습하고 퀴즈로 복습하는 영어 학습 서비스입니다.",
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
