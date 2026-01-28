import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "s4.anilist.co",
      },
      // YouTube thumbnails or embeds are not used with next/image, but add if needed:
      // { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
