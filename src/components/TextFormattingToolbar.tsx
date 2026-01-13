"use client";

import React from 'react';
import { 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  Heading1, 
  Heading2, 
  Quote, 
  MessageSquare 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextFormattingToolbarProps {
  position: { top: number; left: number } | null;
  onFormat: (type: string) => void;
}

const TextFormattingToolbar: React.FC<TextFormattingToolbarProps> = ({ position, onFormat }) => {
  if (!position) return null;

  const buttons = [
    { icon: Bold, label: 'Bold', action: 'bold' },
    { icon: Italic, label: 'Italic', action: 'italic' },
    { icon: LinkIcon, label: 'Link', action: 'link' },
    { icon: Heading1, label: 'H1', action: 'h1' },
    { icon: Heading2, label: 'H2', action: 'h2' },
    { icon: Quote, label: 'Quote', action: 'quote' },
    { icon: MessageSquare, label: 'Note', action: 'note' },
  ];

  return (
    <div 
      className="fixed z-50 flex items-center bg-black rounded-lg shadow-xl px-2 py-1 -translate-x-1/2 -translate-y-full mb-4 transition-all animate-in fade-in zoom-in duration-200"
      style={{ 
        top: position.top, 
        left: position.left 
      }}
    >
      <div className="flex items-center space-x-1">
        {buttons.map((btn, i) => (
          <React.Fragment key={btn.action}>
            <button
              onClick={() => onFormat(btn.action)}
              className="p-2 text-white hover:text-gray-300 transition-colors"
              title={btn.label}
            >
              <btn.icon size={18} />
            </button>
            {i === 2 && <div className="w-[1px] h-4 bg-gray-700 mx-1" />}
          </React.Fragment>
        ))}
      </div>
      {/* Caret/Arrow */}
      <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black" />
    </div>
  );
};

export default TextFormattingToolbar;