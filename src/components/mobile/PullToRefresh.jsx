import React, { useRef, useState, useCallback } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';

const THRESHOLD = 70;
const RESISTANCE = 0.5;

export default function PullToRefresh({ onRefresh, children, className = '' }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const pullDistanceRef = useRef(0);

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e) => {
    if (!pulling.current || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    if (diff > 0) {
      const dist = Math.min(diff * RESISTANCE, THRESHOLD * 1.5);
      pullDistanceRef.current = dist;
      setPullDistance(dist);
    }
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullDistanceRef.current >= THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(THRESHOLD);
      pullDistanceRef.current = THRESHOLD;
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        pullDistanceRef.current = 0;
      }
    } else {
      setPullDistance(0);
      pullDistanceRef.current = 0;
    }
  }, [onRefresh]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={className}
    >
      <div
        style={{ height: pullDistance }}
        className="overflow-hidden flex items-center justify-center"
      >
        {isRefreshing ? (
          <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
        ) : pullDistance > 10 ? (
          <ChevronDown
            className="w-5 h-5 text-slate-400 transition-transform duration-200"
            style={{ transform: pullDistance >= THRESHOLD ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        ) : null}
      </div>
      {children}
    </div>
  );
}