'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GripVertical } from 'lucide-react';

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

export function SlidePanel({
  isOpen,
  onClose,
  children,
  initialWidth = 30, // percentage
  minWidth = 20, // percentage
  maxWidth = 50, // percentage
}: SlidePanelProps) {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, minWidth, maxWidth]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="fixed top-0 bottom-0 right-0 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 flex flex-col overflow-hidden"
      style={{
        width: `${width}%`,
        minWidth: `${width}%`,
        height: '100vh',
        boxShadow: 'rgba(0, 0, 0, 0.1) -4px 0px 6px -1px, rgba(0, 0, 0, 0.06) -2px 0px 4px -1px',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
      }}
    >
      {/* Resize Handle */}
      <div
        className="absolute inset-y-0 left-0 w-4 cursor-ew-resize bg-transparent flex items-center justify-center z-50"
        style={{ transform: 'translateX(-50%)' }}
        onMouseDown={() => setIsResizing(true)}
      >
        <div className="bg-white p-1 rounded-full shadow-md">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}