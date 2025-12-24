import { useState, useEffect } from 'react';

export function useScrollCompact(isLocked) {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (isLocked) return;

    const handleScroll = () => {
      if (!isCompact && window.scrollY > 20) {
        setIsCompact(true);
      } else if (isCompact && window.scrollY < 10) {
        setIsCompact(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isCompact, isLocked]);

  return isCompact;
}
