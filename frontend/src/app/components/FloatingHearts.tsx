import { useEffect, useState } from 'react';

interface Heart {
  id: number;
  left: number;
  duration: number;
  delay: number;
  size: number;
  sway: boolean;
  emoji: string;
}

const HEART_EMOJIS = ['♥', '♡', '❤'];

export function FloatingHearts({ count = 8 }: { count?: number }) {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    const generated: Heart[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 10,
      size: 0.6 + Math.random() * 1.2,
      sway: Math.random() > 0.5,
      emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
    }));
    setHearts(generated);
  }, [count]);

  return (
    <>
      {hearts.map((h) => (
        <span
          key={h.id}
          className={h.sway ? 'floating-heart-sway' : 'floating-heart'}
          style={{
            left: `${h.left}%`,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
            fontSize: `${h.size}rem`,
            color: `rgba(212, 165, 116, ${0.3 + Math.random() * 0.4})`,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </>
  );
}
