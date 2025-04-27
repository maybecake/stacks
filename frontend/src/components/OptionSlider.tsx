import React from 'react';
// import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
// import { DndContext, useDraggable, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
// import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import './option-slider.css';

/**
 * OptionSlider Component
 * 
 * A horizontal slider component for selecting between a set of options.
 * Each option is represented by an icon and can have any value type.
 * 
 * Intended Behavior:
 * 1. Visual Representation:
 *    - Shows a horizontal track with evenly spaced markers for each option
 *    - Displays a draggable handle with the current option's icon
 *    - Handle snaps to the center of each option's position
 * 
 * 2. Interaction:
 *    - Handle can be dragged horizontally along the track
 *    - Movement is restricted to the horizontal axis
 *    - Handle visually snaps to the nearest option position while dragging
 *    - Value changes when handle is released near a different option
 * 
 * 3. Value Selection:
 *    - Changes value only when handle is released near a different option
 *    - Prevents accidental value changes from small movements
 *    - Maintains current selection if not dragged far enough
 */

// interface SliderOption<T> {
//   value: T;
//   icon: string;
// }

// interface OptionsSliderProps<T> {
//   options: SliderOption<T>[];
//   value: T;
//   onChange: (value: T) => void;
// }

// --- DraggableHandle Component ---
interface DraggableHandleProps {
  icon: string;
  isDragging: boolean;
}

const DraggableHandle: React.FC<DraggableHandleProps> = ({ icon, isDragging }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'draggable-handle',
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, 0, 0)`, // Only apply horizontal transform
      }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      style={style}
      className={`option-slider__handle ${isDragging ? 'option-slider__handle--dragging' : ''}`}
      {...listeners}
      {...attributes}
      aria-label="Slider Handle"
    >
      <span className="option-slider__handle-icon">{icon}</span>
    </button>
  );
};

export const OptionsSlider = () => {
    return (
        <div>
            <h1>Options Slider</h1>
            <DraggableHandle icon="🔄" isDragging={false} />
        </div>
    )
}