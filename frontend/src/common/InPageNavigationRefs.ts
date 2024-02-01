import { useRef } from 'react';

export const useInPageNavigationRefs = () => {
    const activeTabLineRef = useRef<HTMLHRElement | null>(null);
    const activeTabRef = useRef<HTMLButtonElement | null>(null);
  
    return { activeTabLineRef, activeTabRef };
  };