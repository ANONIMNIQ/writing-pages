import { useEffect, useRef } from 'react';

export const useAutosizeTextArea = (value: string) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      // Reset height to auto to correctly calculate the new height
      textAreaRef.current.style.height = 'auto';
      // Set height to scroll height
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return textAreaRef;
};