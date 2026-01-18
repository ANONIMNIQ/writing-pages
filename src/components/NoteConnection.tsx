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

    // Increased delay to wait for 'smooth' scroll to finish (approx 500-600ms)
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

        // Hide after 1.5 seconds (down from 2s)
        const hideTimer = setTimeout(() => setIsVisible(false), 1500);
        return () => clearTimeout(hideTimer);
      }
    }, 600); 

    return () => clearTimeout(timer);
  }, [activeNoteId, editorRef]);

  if (!isVisible || !coords) return null;

  return createPortal(
    <svg 
      className="fixed inset-0 pointer-events-none z-[100] overflow-visible"
      style={{ filter: 'drop-shadow(0 0 4px rgba(234, 179, 8, 0.3))' }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" className="fill-yellow-500/80 dark:fill-green-500/80" />
        </marker>
      </defs>
      
      <path
        d={`M ${coords.x1} ${coords.y1} C ${coords.x1 + (coords.x2 - coords.x1) / 2} ${coords.y1}, ${coords.x1 + (coords.x2 - coords.x1) / 2} ${coords.y2}, ${coords.x2} ${coords.y2}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-yellow-500/60 dark:text-green-500/60 animate-in fade-in duration-300"
        strokeDasharray="1000"
        strokeDashoffset="1000"
        style={{
          animation: 'drawPath 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards'
        }}
        markerEnd="url(#arrowhead)"
      />

      <style>{`
        @keyframes drawPath {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </svg>,
    document.body
  );
};

export default NoteConnection;