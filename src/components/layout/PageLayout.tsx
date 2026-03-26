'use client';

import FpsCounter from '@/components/gallery/FpsCounter';

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div
      style={{
        background: '#0d0d0d',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      {/* Always-visible FPS counter (toggle with F key) */}
      <FpsCounter />

      {children}
    </div>
  );
}
