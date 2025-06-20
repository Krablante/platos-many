
import React from 'react';

interface TransformedTextViewProps {
  text: string;
  isTransformingActive?: boolean;
}

const PALETTE = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0000', '#00FF00', '#FFFFFF', '#8A2BE2', '#FF4500', '#7FFF00', '#FF69B4', '#ADFF2F', '#1E90FF', '#FF6347', '#BA55D3', '#40E0D0'];
const FONTS = ['Courier New', 'Georgia', 'Times New Roman', 'Arial', 'Verdana', 'Impact', 'Comic Sans MS', 'cursive', 'fantasy', 'monospace', 'Share Tech Mono'];

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const TransformedChar: React.FC<{ char: string; charIndex: number }> = React.memo(({ char, charIndex }) => {
  const style: React.CSSProperties = {
    display: 'inline-block',
    color: getRandomItem(PALETTE),
    fontFamily: getRandomItem(FONTS),
    fontWeight: Math.random() > 0.6 ? 'bold' : 'normal',
    fontStyle: Math.random() > 0.75 ? 'italic' : 'normal',
    fontSize: `${0.75 + Math.random() * 1.15}em`, // 0.75em to 1.9em
    transform: `rotate(${Math.random() * 24 - 12}deg) translate(${Math.random() * 8 - 4}px, ${Math.random() * 8 - 4}px) skew(${Math.random() * 18 - 9}deg, ${Math.random() * 18 - 9}deg) scale(${0.85 + Math.random() * 0.35})`,
    margin: `0 ${Math.random() * 2.5}px`,
    textShadow: Math.random() > 0.8 ? `1px 1px 4px ${getRandomItem(PALETTE)}, -1px -1px 4px ${getRandomItem(PALETTE)}` : 'none',
    opacity: Math.random() * 0.25 + 0.75, // 0.75 to 1.0
    transition: 'all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)', 
  };

  if (char === ' ') {
    return <span style={{ padding: `0 ${Math.random() * 3.5}px` }}>&nbsp;</span>;
  }
  if (char === '\n') {
    return <br />;
  }

  return <span style={style}>{char}</span>;
});
TransformedChar.displayName = 'TransformedChar';


export const TransformedTextView: React.FC<TransformedTextViewProps> = ({ text, isTransformingActive = false }) => {
  const containerClasses = `
    whitespace-pre-wrap break-words p-4 md:p-6 border-2 border-dashed 
    rounded-lg bg-gray-800/70 backdrop-blur-sm shadow-2xl w-full min-h-[250px] 
    text-left overflow-y-auto max-h-[450px] transition-all duration-500
    ${isTransformingActive ? 'pulse-border-purple border-opacity-100' : 'border-purple-600/70 border-opacity-70'}
  `;

  return (
    <div 
      className={containerClasses}
      aria-live="polite" 
      aria-atomic="false" 
      aria-relevant="text"
      role="log"
    >
      {text.split('').map((char, index) => (
        <TransformedChar key={`${index}-${char}`} char={char} charIndex={index} />
      ))}
    </div>
  );
};
