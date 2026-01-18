import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface NoteConnectionProps {
  activeNoteId: string | null;
  editorRef: React.RefObject<HTMLDivElement>;
}

const NoteConnection: React.FC<NoteConnectionProps> = ({ activeNoteId, editorRef }) => {
  const [coords, setCoords] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!activeNoteId || !editorRef.current) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      const highlight = editorRef.current?.querySelector(`.note-highlight[data-note-id="${activeNoteId}"]`);
      const noteCard = document.getElementById(`note-card-${activeNoteId}`);

      if (highlight && noteCard) {
        const hRect = highlight.getBoundingClientRect();
        const nRect = noteCard.getBoundingClientRect();

        setCoords({
          x1: hRect.right,
          y1: hRect.top + hRect.height / 2,
          x2: nRect.left,
          y2: nRect.top + nRect.height / 2
        });
        setIsVisible(true);

        const hideTimer = setTimeout(() => setIsVisible(false), 2000);
        return () => clearTimeout(hideTimer);
      }
    }, 600); 

    return () => clearTimeout(timer);
  }, [activeNoteId, editorRef]);

  if (!isVisible || !coords) return null;

  // Calculate the angle for the arrowhead
  const angle = Math.atan2(coords.y2 - coords.y1, coords.x2 - coords.x1) * 180 / Math.PI;

  return createPortal(
    <svg 
      className="fixed inset-0 pointer-events-none z-[100] overflow-visible"
      style={{ filter: 'drop-shadow(0 0 4px rgba(234, 179, 8, 0.4))' }}
    >
      {/* Path with high dasharray to prevent cutting on long distances */}
      <path
        d={`M ${coords.x1} ${coords.y1} C ${coords.x1 + (coords.x2 - coords.x1) / 2} ${coords.y1}, ${coords.x1 + (coords.x2 - coords.x1) / 2} ${coords.y2}, ${coords.x2} ${coords.y2}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-yellow-500/60 dark:text-green-500/60"
        strokeDasharray="5000"
        strokeDashoffset="5000"
        style={{
          animation: 'drawPath 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards'
        }}
      />

      {/* Separate Arrowhead that appears instantly after the line finishes drawing */}
      <g 
        transform={`translate(${coords.x2}, ${coords.y2}) rotate(${angle})`}
        className="opacity-0"
        style={{
          animation: 'popIn 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.45s forwards'
        }}
      >
        <polygon 
          points="-10,-6 2,0 -10,6" 
          className="fill-yellow-500 dark:fill-green-500" 
        />
      </g>

      <style>{`
        @keyframes drawPath {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes popIn {
          from {
            opacity: 0;
            transform: translate(${coords.x2}px, ${coords.y2}px) rotate(${angle}deg) scale(0);
          }
          to {
            opacity: 1;
            transform: translate(${coords.x2}px, ${coords.y2}px) rotate(${angle}deg) scale(1);
          }
        }
      `}</style>
    </svg>,
    document.body
  );
};

export default NoteConnection;