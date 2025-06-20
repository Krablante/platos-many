
import React, { useState, useEffect, useRef } from 'react';
import { TransformedTextView } from './components/TransformedTextView';
import { applyRandomStringTransformation, animateHeadline } from './utils/transformations';

const LOCAL_STORAGE_KEY = 'chaoticNote';
const DEFAULT_TRANSFORMATION_INTERVAL_MS = 750; // Milliseconds for note transformation
const INITIAL_HEADLINE = "Заметки-Метаморфозы";
const HEADLINE_SEQUENTIAL_CHAR_INTERVAL_MS = 120; // Speed of individual char change in headline

// SVG Icons (unchanged)
const PlayIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M8 5v14l11-7z"></path></svg>
);
const PauseIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
);
const TrashIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2-8h2v6H8v-6zm4 0h2v6h-2v-6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
);


const App: React.FC = () => {
  const [note, setNote] = useState<string>('');
  const [isTransforming, setIsTransforming] = useState<boolean>(true);
  const [transformationSpeed, setTransformationSpeed] = useState<number>(DEFAULT_TRANSFORMATION_INTERVAL_MS);
  
  // Headline animation state
  const [animatedHeadline, setAnimatedHeadline] = useState<string>(INITIAL_HEADLINE);
  const [targetHeadlineActualString, setTargetHeadlineActualString] = useState<string>(() => animateHeadline(INITIAL_HEADLINE));
  const [currentHeadlineUpdateIndex, setCurrentHeadlineUpdateIndex] = useState<number>(0);
  const [currentHeadlineDirection, setCurrentHeadlineDirection] = useState<'ltr' | 'rtl'>('ltr');

  // Refs for interval access to latest headline animation values
  const targetHeadlineRef = useRef(targetHeadlineActualString);
  const headlineIndexRef = useRef(currentHeadlineUpdateIndex);
  const headlineDirectionRef = useRef(currentHeadlineDirection);

  // Update refs when actual state changes
  useEffect(() => { targetHeadlineRef.current = targetHeadlineActualString; }, [targetHeadlineActualString]);
  useEffect(() => { headlineIndexRef.current = currentHeadlineUpdateIndex; }, [currentHeadlineUpdateIndex]);
  useEffect(() => { headlineDirectionRef.current = currentHeadlineDirection; }, [currentHeadlineDirection]);

  useEffect(() => {
    const savedNote = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedNote) {
      setNote(savedNote);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, note);
  }, [note]);

  useEffect(() => {
    let noteIntervalId: number | undefined = undefined;
    let headlineIntervalId: number | undefined = undefined;

    if (isTransforming) {
      noteIntervalId = setInterval(() => {
        setNote(prevNote => applyRandomStringTransformation(prevNote));
      }, transformationSpeed) as unknown as number; // Use dynamic transformationSpeed
    
      headlineIntervalId = setInterval(() => {
        // Update one character of animatedHeadline towards the target in ref
        setAnimatedHeadline(prevHeadline => {
          const currentDisplayChars = prevHeadline.split('');
          const targetChars = (targetHeadlineRef.current || "").split(''); 
          const updateIdx = headlineIndexRef.current;

          if (updateIdx >= 0 && updateIdx < currentDisplayChars.length && updateIdx < targetChars.length && currentDisplayChars[updateIdx] !== targetChars[updateIdx]) {
            currentDisplayChars[updateIdx] = targetChars[updateIdx];
            return currentDisplayChars.join('');
          }
          return prevHeadline;
        });

        // Advance index and potentially change direction and target
        let nextIndex = headlineIndexRef.current;
        let newDirection = headlineDirectionRef.current; 

        if (newDirection === 'ltr') {
          if (nextIndex < INITIAL_HEADLINE.length - 1) {
            nextIndex++;
          } else { 
            newDirection = 'rtl';
            const newTarget = animateHeadline(INITIAL_HEADLINE);
            targetHeadlineRef.current = newTarget; 
            setTargetHeadlineActualString(newTarget); 
          }
        } else { 
          if (nextIndex > 0) {
            nextIndex--;
          } else { 
            newDirection = 'ltr';
            const newTarget = animateHeadline(INITIAL_HEADLINE);
            targetHeadlineRef.current = newTarget; 
            setTargetHeadlineActualString(newTarget); 
          }
        }
        
        setCurrentHeadlineUpdateIndex(nextIndex);
        setCurrentHeadlineDirection(newDirection);

      }, HEADLINE_SEQUENTIAL_CHAR_INTERVAL_MS) as unknown as number;
    }

    return () => {
      if (noteIntervalId) clearInterval(noteIntervalId);
      if (headlineIntervalId) clearInterval(headlineIntervalId);
    };
  }, [isTransforming, transformationSpeed]); // Add transformationSpeed to dependencies

  const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(event.target.value);
  };

  const toggleTransformations = () => {
    setIsTransforming(prev => !prev);
  };

  const clearNote = () => {
    setNote('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8 selection:bg-purple-600 selection:text-white">
      <header className="mb-10 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400">
          {animatedHeadline.split('').map((char, index) => (
            <span 
              key={`${index}-${char}`} 
              className="matrix-char-smooth"
            >
              {char}
            </span>
          ))}
        </h1>
        <p className="text-cyan-400 mt-3 text-sm sm:text-base tracking-wider opacity-80">
          Bello, non pace
        </p>
      </header>

      <div className="w-full max-w-3xl space-y-8">
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <button
            onClick={toggleTransformations}
            aria-pressed={isTransforming}
            className={`button-glitch flex items-center justify-center px-6 py-3 rounded-md font-semibold text-white
                        transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
                        ${isTransforming
                          ? 'bg-pink-600/70 hover:bg-pink-500/80 transforming-button focus:ring-pink-500'
                          : 'bg-green-500/70 hover:bg-green-400/80 start-transforming-button focus:ring-green-400'
                        }`}
          >
            {isTransforming ? <PauseIcon className="w-5 h-5 mr-2" /> : <PlayIcon className="w-5 h-5 mr-2" />}
            {isTransforming ? 'Остановить Хаос' : 'Возобновить Хаос'}
          </button>
          <button
            onClick={clearNote}
            className="button-glitch clear-button flex items-center justify-center px-6 py-3 rounded-md font-semibold bg-gray-700/70 hover:bg-gray-600/80 text-white
                       transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500"
          >
            <TrashIcon className="w-5 h-5 mr-2" />
            Очистить Заметку
          </button>
        </div>

        <div className="flex flex-col items-center space-y-3 mt-6 pt-4 border-t border-gray-700/50">
          <label htmlFor="chaos-speed-slider" className="text-sm text-purple-300 tracking-wider">
            Скорость Хаоса: <span className="font-semibold text-purple-200 tabular-nums">{transformationSpeed} мс</span>
          </label>
          <input
            id="chaos-speed-slider"
            type="range"
            min="100"
            max="2000"
            step="50"
            value={transformationSpeed}
            onChange={(e) => setTransformationSpeed(Number(e.target.value))}
            className="w-full max-w-xs chaos-slider"
            aria-label="Регулятор скорости трансформаций заметки"
            aria-valuetext={`${transformationSpeed} миллисекунд`}
          />
        </div>

        <textarea
          value={note}
          onChange={handleNoteChange}
          placeholder="Излейте свой поток бессознания... здесь он найдет свою истинную форму..."
          className="w-full h-56 sm:h-64 p-4 bg-gray-800/80 border-2 border-gray-700 rounded-lg text-gray-200
                     focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none shadow-inner
                     transition-colors duration-300 placeholder-gray-500 hover:border-gray-600
                     font-['Courier_New',_Courier,_monospace] text-base"
          aria-label="Поле для ввода заметки"
        />

        <div className="mt-8">
          <h2 className="text-3xl font-semibold text-purple-400 mb-4 text-center tracking-wider">
            id vivit
          </h2>
          <TransformedTextView text={note} isTransformingActive={isTransforming} />
        </div>
      </div>

      <footer className="mt-16 mb-6 text-center text-gray-500 text-xs opacity-75">
        <p>&copy; {new Date().getFullYear()} Корпорация Анти-Порядка. Все права... искажены.</p>
        <p className="mt-1">Навеяно энтропией, крепким кофе и тенями киберпространства.</p>
      </footer>
    </div>
  );
};

export default App;
