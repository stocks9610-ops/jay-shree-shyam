
import React, { useEffect, useRef } from 'react';

const FLAGS = [
  '🇵🇰', '🇦🇪', '🇧🇩', '🇮🇷', '🇦🇫', '🇮🇶', '🇵🇸', '🇸🇦', '🇶🇦', '🇰🇼', 
  '🇴🇲', '🇧🇭', '🇪🇬', '🇯🇴', '🇱🇧', '🇸🇾', '🇾🇪', '🇹🇷', '🇲🇾', '🇮🇩', 
  '🇩🇿', '🇲🇦'
];

interface FlagData {
  x: number;
  y: number;
  dx: number;
  dy: number;
  element: HTMLDivElement | null;
}

const FloatingFlags: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const flagsDataRef = useRef<FlagData[]>([]);
  const requestRef = useRef<number>(null);

  useEffect(() => {
    // Initialize flag data only once
    if (flagsDataRef.current.length === 0) {
      flagsDataRef.current = FLAGS.map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        dx: (Math.random() - 0.5) * 1.5,
        dy: (Math.random() - 0.5) * 1.5,
        element: null
      }));
    }

    const animate = () => {
      if (!containerRef.current) return;
      const width = window.innerWidth;
      const height = window.innerHeight;

      flagsDataRef.current.forEach((flag) => {
        // Update positions
        flag.x += flag.dx;
        flag.y += flag.dy;

        // Bounce logic
        if (flag.x <= 0 || flag.x >= width - 30) flag.dx *= -1;
        if (flag.y <= 0 || flag.y >= height - 30) flag.dy *= -1;

        // Direct DOM update (High Performance)
        if (flag.element) {
          flag.element.style.transform = `translate3d(${flag.x}px, ${flag.y}px, 0)`;
        }
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
      {FLAGS.map((emoji, i) => (
        <div
          key={i}
          ref={(el) => {
            if (flagsDataRef.current[i]) {
              flagsDataRef.current[i].element = el;
            }
          }}
          className="absolute text-xl md:text-2xl will-change-transform"
          style={{
            // Initial position to prevent flash, subsequent updates via JS
            transform: `translate3d(${Math.random() * 100}vw, ${Math.random() * 100}vh, 0)`,
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
};

export default FloatingFlags;
