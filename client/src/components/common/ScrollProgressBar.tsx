import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useSettingsStore } from '../../store/useSettingsStore';

export const ScrollProgressBar: React.FC = () => {
  const { enableScrollAnimations, theme } = useSettingsStore();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 30,
    restDelta: 0.001
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsVisible(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!enableScrollAnimations) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50 pointer-events-none overflow-hidden">
      {/* Background Track */}
      <div className="absolute inset-0 bg-transparent" />

      {/* Animated Gradient Fill */}
      <motion.div
        style={{ scaleX, transformOrigin: '0%' }}
        className={`h-full w-full ${
          isDark 
            ? 'bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-300 shadow-[0_0_12px_rgba(243,183,78,0.7)]' 
            : 'bg-gradient-to-r from-forest-700 via-amber-500 to-forest-900 shadow-[0_0_10px_rgba(27,67,50,0.5)]'
        }`}
      />
    </div>
  );
};
