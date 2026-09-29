import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { useSettingsStore } from '../../store/useSettingsStore';

export const MouseTracker: React.FC = () => {
  const { enableMouseTracker, theme } = useSettingsStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Position motion values
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth lagging spring physics
  const springConfig = { damping: 28, stiffness: 350, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Trailing ambient halo (softer spring)
  const haloSpringConfig = { damping: 35, stiffness: 180, mass: 0.8 };
  const haloX = useSpring(mouseX, haloSpringConfig);
  const haloY = useSpring(mouseY, haloSpringConfig);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest('button') ||
          target.closest('a') ||
          target.closest('input') ||
          target.closest('select') ||
          target.closest('[role="button"]') ||
          target.closest('.cursor-pointer') ||
          target.closest('.glass-panel-interactive')
        );
        setIsHovered(isInteractive);
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, mouseX, mouseY]);

  if (!enableMouseTracker || isTouchDevice || !isVisible) {
    return null;
  }

  const isDark = theme === 'dark';

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* 1. Ambient Aurora Glow Halo */}
      <motion.div
        style={{
          x: haloX,
          y: haloY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicked ? 1.5 : isHovered ? 2.4 : 1.0,
          opacity: isClicked ? 0.35 : isHovered ? 0.3 : isDark ? 0.18 : 0.12,
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`fixed w-36 h-36 rounded-full blur-2xl ${
          isDark 
            ? 'bg-gradient-to-r from-emerald-500/30 via-cyan-500/25 to-indigo-500/30' 
            : 'bg-gradient-to-r from-emerald-600/25 via-cyan-600/20 to-teal-600/20'
        }`}
      />

      {/* 2. Interactive Outer Ring */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicked ? 0.8 : isHovered ? 1.6 : 1.0,
          borderColor: isHovered 
            ? (isDark ? 'rgba(16, 185, 129, 0.9)' : 'rgba(16, 185, 129, 0.8)')
            : (isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.3)'),
          backgroundColor: isHovered 
            ? (isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.06)')
            : 'transparent'
        }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="fixed w-7 h-7 rounded-full border border-dashed transition-colors"
      />

      {/* 3. Center Target Dot */}
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicked ? 0.5 : isHovered ? 0 : 1,
          opacity: isHovered ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
        className={`fixed w-1.5 h-1.5 rounded-full shadow-xs ${
          isDark ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]' : 'bg-emerald-600 shadow-[0_0_6px_rgba(16,185,129,0.7)]'
        }`}
      />
    </div>
  );
};
