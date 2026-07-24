import React, { useRef, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import './option-slider.css';

export interface SliderOption<T> {
  value: T;
  icon: string;
}

export interface OptionsSliderProps<T> {
  options: SliderOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

const PADDING = 20; // matches .option-slider padding in CSS

const DraggableHandle: React.FC<{ icon: string; isDragging: boolean }> = ({ icon, isDragging }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: 'option-slider-handle' });
  return (
    <button
      ref={setNodeRef}
      className={`option-slider__handle ${isDragging ? 'option-slider__handle--dragging' : ''}`}
      {...listeners}
      {...attributes}
      aria-label="Slider handle"
    >
      <span className="option-slider__handle-icon">{icon}</span>
    </button>
  );
};

// Generic function component — trailing comma avoids JSX ambiguity in .tsx
export function OptionsSlider<T,>({ options, value, onChange }: OptionsSliderProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  const currentIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const [visualIndex, setVisualIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const displayIndex = visualIndex ?? currentIndex;
  const displayOption = options[displayIndex];

  // fraction in [0, 1] representing position along the track
  const fraction = options.length <= 1 ? 0 : displayIndex / (options.length - 1);

  // Handle container left such that the handle (with its translateX(-50%)) is centered at the
  // option's position on the track. At fraction=0: PADDING px; at fraction=1: 100% - PADDING px.
  const handleLeft = `calc(${fraction * 100}% + ${PADDING * (1 - 2 * fraction)}px)`;

  const getNearestIndex = (deltaX: number): number => {
    if (!trackRef.current || options.length <= 1) return currentIndex;
    const trackWidth = trackRef.current.offsetWidth;
    const currentPixel = (currentIndex / (options.length - 1)) * trackWidth;
    const newPixel = Math.max(0, Math.min(trackWidth, currentPixel + deltaX));
    return Math.round((newPixel / trackWidth) * (options.length - 1));
  };

  const handleDragStart = (_event: DragStartEvent) => {
    setIsDragging(true);
    setVisualIndex(currentIndex);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    setVisualIndex(getNearestIndex(event.delta.x));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const nearestIndex = getNearestIndex(event.delta.x);
    setIsDragging(false);
    setVisualIndex(null);
    if (nearestIndex !== currentIndex) {
      onChange(options[nearestIndex].value);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToHorizontalAxis]}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div className="option-slider">
        <div ref={trackRef} className="option-slider__track">
          {options.map((_, index) => (
            <div
              key={index}
              className="option-slider__marker"
              style={{
                left:
                  options.length <= 1 ? '50%' : `${(index / (options.length - 1)) * 100}%`,
              }}
            />
          ))}
        </div>
        <div className="option-slider__handle-container" style={{ left: handleLeft }}>
          <DraggableHandle icon={displayOption.icon} isDragging={isDragging} />
        </div>
      </div>
    </DndContext>
  );
}
