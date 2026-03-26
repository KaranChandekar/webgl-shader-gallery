"use client";

import dynamic from "next/dynamic";
import PageLayout from "@/components/layout/PageLayout";

const GalleryScroll = dynamic(
  () => import("@/components/gallery/GalleryScroll"),
  { ssr: false }
);

export default function Home() {
  return (
    <PageLayout>
      <GalleryScroll />
    </PageLayout>
  );
}
