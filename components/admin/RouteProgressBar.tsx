'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function RouteProgressBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Complete progress bar whenever pathname changes
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Intercept all internal navigation clicks for instant loading bar
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Only trigger for internal links that differ from current pathname
      if (
        href.startsWith('/admin') &&
        href !== pathname &&
        !href.startsWith('#') &&
        !anchor.hasAttribute('target') &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        setLoading(true);
        setProgress(20);
      }
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => document.removeEventListener('click', handleDocumentClick, true);
  }, [pathname]);

  // Animate progress incrementally while loading
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const diff = Math.max(1, (90 - prev) * 0.2);
        return Math.min(90, prev + diff);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [loading]);

  if (!loading && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] h-1 pointer-events-none transition-opacity duration-300"
      style={{ opacity: loading ? 1 : 0 }}
    >
      <div
        className="h-full bg-linear-to-r from-pink-500 via-rose-500 to-pink-600 transition-all duration-200 ease-out shadow-[0_0_12px_rgba(236,72,153,0.8)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
