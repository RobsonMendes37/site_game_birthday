import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Item } from '../types';
import { 
  ASSETS, 
  GRAVITY_SPEED_BASE, 
  ITEM_WIDTH_PERCENT, 
  PLAYER_WIDTH_PERCENT, 
  SPAWN_RATE_MS, 
  WIN_SCORE,
  playSound
} from '../constants';

interface GameLoopProps {
  avatar: string;
  onWin: () => void;
  onGameOver: () => void;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

const GameLoop: React.FC<GameLoopProps> = ({ avatar, onWin, onGameOver }) => {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [playerX, setPlayerX] = useState(50);
  const [items, setItems] = useState<Item[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef<number>(0);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);

  const spawnItem = useCallback(() => {
    const isBad = Math.random() < 0.3; 
    const sourceArray = isBad ? ASSETS.bad : ASSETS.good;
    const randomIcon = sourceArray[Math.floor(Math.random() * sourceArray.length)];
    
    const randomX = Math.random() * (100 - ITEM_WIDTH_PERCENT);

    const newItem: Item = {
      id: Date.now() + Math.random(),
      x: randomX,
      y: -15,
      type: randomIcon,
      kind: isBad ? 'bad' : 'good',
      speed: GRAVITY_SPEED_BASE + (Math.random() * 0.4),
    };

    setItems(prev => [...prev, newItem]);
  }, []);

  const triggerFeedback = (x: number, y: number, text: string, color: string) => {
    const newText: FloatingText = {
      id: Date.now(),
      x,
      y,
      text,
      color
    };
    setFloatingTexts(prev => [...prev, newText]);
    // Remove after animation
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== newText.id));
    }, 800);
  };

  const updateGame = useCallback((time: number) => {
    if (lastTimeRef.current === 0) lastTimeRef.current = time;
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    if (time - lastSpawnTimeRef.current > SPAWN_RATE_MS) {
      spawnItem();
      lastSpawnTimeRef.current = time;
    }

    setItems(prevItems => {
      const nextItems: Item[] = [];
      let scoreDelta = 0;
      let livesDelta = 0;

      prevItems.forEach(item => {
        const nextY = item.y + (item.speed * (deltaTime / 16));

        const playerTopY = 82; 
        const playerBottomY = 98;
        const playerLeft = playerX - (PLAYER_WIDTH_PERCENT / 2);
        const playerRight = playerX + (PLAYER_WIDTH_PERCENT / 2);
        const itemLeft = item.x;
        const itemRight = item.x + ITEM_WIDTH_PERCENT;

        const isHorizontalOverlap = (itemRight > playerLeft + 2) && (itemLeft < playerRight - 2);
        const isVerticalOverlap = (nextY + ITEM_WIDTH_PERCENT > playerTopY) && (nextY < playerBottomY);

        if (isHorizontalOverlap && isVerticalOverlap) {
          // HIT!
          if (item.kind === 'good') {
             scoreDelta += 5;
             playSound('collect');
             triggerFeedback(item.x, nextY, '+5', 'text-yellow-400');
          } else {
             livesDelta -= 1;
             playSound('damage');
             triggerFeedback(item.x, nextY, 'AI!', 'text-red-500');
             setIsShaking(true);
             setTimeout(() => setIsShaking(false), 300);
          }
        } else if (nextY > 100) {
          // Missed
        } else {
          nextItems.push({ ...item, y: nextY });
        }
      });

      if (scoreDelta !== 0 || livesDelta !== 0) {
        if (livesDelta < 0) {
           livesRef.current += livesDelta;
           setLives(livesRef.current);
           if (livesRef.current <= 0) {
             setTimeout(onGameOver, 0);
             return [];
           }
        }

        if (scoreDelta > 0) {
          scoreRef.current += scoreDelta;
          setScore(scoreRef.current);
          if (scoreRef.current >= WIN_SCORE) {
             playSound('win');
             setTimeout(onWin, 0);
             return [];
          }
        }
      }

      return nextItems;
    });

    if (livesRef.current > 0 && scoreRef.current < WIN_SCORE) {
      requestRef.current = requestAnimationFrame(updateGame);
    }
  }, [playerX, onWin, onGameOver, spawnItem]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGame);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [updateGame]);

  const handlePointerMove = (clientX: number) => {
    if (!gameContainerRef.current) return;
    const rect = gameContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const clamped = Math.max(PLAYER_WIDTH_PERCENT / 2, Math.min(100 - PLAYER_WIDTH_PERCENT / 2, percentage));
    setPlayerX(clamped);
  };

  return (
    <div 
      ref={gameContainerRef}
      className={`relative w-full h-full overflow-hidden touch-none cursor-ew-resize ${isShaking ? 'animate-[ping_0.1s]' : ''}`}
      style={isShaking ? { transform: 'translate(2px, 2px)' } : {}}
      onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
      onMouseMove={(e) => handlePointerMove(e.clientX)}
    >
      {/* HUD */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-20">
        <div className="flex flex-col">
           <span className="text-white font-bold text-lg drop-shadow-md">Vidas</span>
           <div className="flex gap-1 text-2xl">
             {[...Array(3)].map((_, i) => (
               <span key={i} className={`transition-opacity ${i < lives ? 'opacity-100' : 'opacity-30 grayscale'}`}>
                 ❤️
               </span>
             ))}
           </div>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-white font-bold text-lg drop-shadow-md">Pontos</span>
           <span className="text-3xl font-display text-white drop-shadow-lg">{score} / {WIN_SCORE}</span>
        </div>
      </div>

      {/* Floating Texts */}
      {floatingTexts.map(ft => (
        <div 
          key={ft.id}
          className={`absolute font-bold text-2xl z-30 pointer-events-none animate-bounce ${ft.color}`}
          style={{ left: `${ft.x}%`, top: `${ft.y}%` }}
        >
          {ft.text}
        </div>
      ))}

      {/* Items */}
      {items.map(item => (
        <div
          key={item.id}
          className="absolute flex items-center justify-center text-4xl select-none will-change-transform"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            width: `${ITEM_WIDTH_PERCENT}%`,
            height: `${ITEM_WIDTH_PERCENT}%`,
          }}
        >
          {item.type}
        </div>
      ))}

      {/* Player */}
      <div 
        className="absolute bottom-6 flex items-center justify-center text-7xl select-none transition-all duration-75 ease-out will-change-transform drop-shadow-2xl"
        style={{
          left: `${playerX}%`,
          transform: 'translateX(-50%)',
          width: `${PLAYER_WIDTH_PERCENT}%`
        }}
      >
        {avatar}
      </div>
      
      {/* Floor hint */}
      <div className="absolute bottom-0 w-full h-4 bg-white/20 blur-sm rounded-t-full"></div>
    </div>
  );
};

export default GameLoop;