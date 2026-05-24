import { useState, useEffect, useRef } from 'react';
import './times.css'

interface Segments {
    entities: Record<number, string[]>;
}

const SEGMENT_MAP: Segments = {
  entities: {
    0: ['a', 'b', 'c', 'd', 'e', 'f'],
    1: ['b', 'c'],
    2: ['a', 'b', 'g', 'e', 'd'],
    3: ['a', 'b', 'g', 'c', 'd'],
    4: ['f', 'g', 'b', 'c'],
    5: ['a', 'f', 'g', 'c', 'd'],
    6: ['a', 'f', 'g', 'e', 'c', 'd'],
    7: ['a', 'b', 'c'],
    8: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    9: ['a', 'b', 'g', 'c', 'd', 'f'],
  }
};

const SevenSegmentDigit = ({ value } : { value: number}) => {
  const activeSegments = SEGMENT_MAP.entities[value] || [];
  return (
    <div className="digit-container">
      {['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((seg) => (
        <div key={seg} className={`segment segment-${seg} ${activeSegments.includes(seg) ? 'active' : ''}`} />
      ))}
    </div>
  );
};

// Receives secondsLeft and setSecondsLeft from Parent
interface TimerProps {
  secondsLeft: number;
  setSecondsLeft: any;
}

const Timer = ({ secondsLeft, setSecondsLeft }: TimerProps) => {
  const [isActive, setIsActive] = useState(false);
  const [inputMin, setInputMin] = useState(Math.floor(secondsLeft / 60));
  const [inputSec, setInputSec] = useState(secondsLeft % 60);

  const intervalRef = useRef(0);
  const endTimeRef = useRef(0);
  const pausedTimeLeftRef = useRef(secondsLeft * 1000);

  useEffect(() => {
    if (isActive) {
      endTimeRef.current = Date.now() + pausedTimeLeftRef.current;

      intervalRef.current = setInterval(() => {
        const remainingMs = endTimeRef.current - Date.now();

        if (remainingMs <= 0) {
          clearInterval(intervalRef.current);
          setSecondsLeft(0); // Updates Parent State
          setIsActive(false);
          pausedTimeLeftRef.current = 0;
        } else {
          setSecondsLeft(Math.ceil(remainingMs / 1000)); // Updates Parent State
          pausedTimeLeftRef.current = remainingMs;
        }
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, setSecondsLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.repeat) return;
      (event.keyCode === 32) ? toggleTimer() : null;
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    const totalSeconds = (parseInt(inputMin.toLocaleString()) || 0) * 60 + (parseInt(inputSec.toLocaleString()) || 0);
    pausedTimeLeftRef.current = totalSeconds * 1000;
    setSecondsLeft(totalSeconds);
  };

  const handleTimeSubmit = (e: any) => {
    e.preventDefault();
    setIsActive(false);
    const mins = Math.max(0, parseInt(inputMin.toLocaleString()) || 0);
    const secs = Math.max(0, Math.min(59, parseInt(inputSec.toLocaleString()) || 0));
    setInputMin(mins);
    setInputSec(secs);

    const totalSeconds = (mins * 60) + secs;
    pausedTimeLeftRef.current = totalSeconds * 1000;
    setSecondsLeft(totalSeconds);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="retro-timer-wrapper">
      <div className="controls">
        <button onClick={toggleTimer} className="btn-retro">{isActive ? 'PAUSE' : 'START'}</button>
        <button onClick={resetTimer} className="btn-retro">RESET</button>
      </div>  
      <div className="display-panel">
        <SevenSegmentDigit value={Math.floor(minutes / 10)} />
        <SevenSegmentDigit value={minutes % 10} />
        <div className={`colon ${isActive ? 'blinking' : ''}`}><div className="dot"></div><div className="dot"></div></div>
        <SevenSegmentDigit value={Math.floor(seconds / 10)} />
        <SevenSegmentDigit value={seconds % 10} />
      </div>
      <form onSubmit={handleTimeSubmit} className="input-form">
        <label className='timer-label'>MIN:<input type="number" value={inputMin} onChange={(e) => setInputMin(Number(e.target.value))} min="0" /></label>
        <label className='timer-label'>SEC:<input type="number" value={inputSec} onChange={(e) => setInputSec(Number(e.target.value))} min="0" max="59" /></label>
        <button type="submit" className="btn-retro sm">SET</button>
      </form>
    </div>
  );
};

export default Timer;