import React, { useState, useEffect } from 'react';
import './Typewriter.css';

const Typewriter = ({ 
  text, 
  speed = 50, 
  delay = 0, 
  onComplete,
  className = '',
  showCursor = true,
  cursorChar = '|'
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) return;

    const startTyping = () => {
      setIsTyping(true);
      setCurrentIndex(0);
      setDisplayedText('');

      const typeInterval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          if (prevIndex < text.length) {
            setDisplayedText(text.substring(0, prevIndex + 1));
            return prevIndex + 1;
          } else {
            clearInterval(typeInterval);
            setIsTyping(false);
            if (onComplete) onComplete();
            return prevIndex;
          }
        });
      }, speed);

      return () => clearInterval(typeInterval);
    };

    const timeoutId = setTimeout(startTyping, delay);
    return () => clearTimeout(timeoutId);
  }, [text, speed, delay, onComplete]);

  return (
    <span className={`typewriter ${className}`}>
      {displayedText}
      {showCursor && (
        <span className={`typewriter-cursor ${isTyping ? 'typing' : ''}`}>
          {cursorChar}
        </span>
      )}
    </span>
  );
};

export default Typewriter;


