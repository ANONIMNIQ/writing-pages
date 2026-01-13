import * as React from 'react';

export const useAutosizeTextArea = (value: string) => {
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const textArea = textAreaRef.current;
    if (textArea) {
      // Reset height to auto to correctly calculate the new height
      textArea.style.height = 'auto';
      // Set height to scroll height
      textArea.style.height = `${textArea.scrollHeight}px`;
    }
  }, [value]);

  return textAreaRef;
};