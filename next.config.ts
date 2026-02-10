import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // 노션 S3 — 페이지 내 이미지, 파일 첨부
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
      },
      {
        // 노션 자체 호스팅 이미지
        protocol: "https",
        hostname: "www.notion.so",
      },
      {
        // Unsplash — 노션 커버 이미지에서 자주 사용
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // 메이크샵 상품 이미지
        protocol: "https",
        hostname: "www.foreverlove.co.kr",
      },
    ],
  },
};

export default nextConfig;
