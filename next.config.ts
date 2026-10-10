import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Category / candidate images live in Supabase Storage, so the Next.js
    // <Image> optimizer is allowed to fetch them.
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
};

export default nextConfig;
