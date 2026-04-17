import { useEffect, useRef } from 'react';
import { VirtualInput, type VirtualAction } from '../engine/VirtualInput';
import './TouchControls.css';

const useTouchButton = (ref: React.RefObject<HTMLElement | null>, action: VirtualAction) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onStart = (e: TouchEvent | MouseEvent) => { e.preventDefault(); VirtualInput.press(action); };
    const onEnd   = (e: TouchEvent | MouseEvent) => { e.preventDefault(); VirtualInput.release(action); };
    el.addEventListener('touchstart',  onStart, { passive: false });
    el.addEventListener('touchend',    onEnd,   { passive: false });
    el.addEventListener('touchcancel', onEnd,   { passive: false });
    el.addEventListener('mousedown',   onStart);
    el.addEventListener('mouseup',     onEnd);
    el.addEventListener('mouseleave',  onEnd);
    return () => {
      el.removeEventListener('touchstart',  onStart);
      el.removeEventListener('touchend',    onEnd);
      el.removeEventListener('touchcancel', onEnd);
      el.removeEventListener('mousedown',   onStart);
      el.removeEventListener('mouseup',     onEnd);
      el.removeEventListener('mouseleave',  onEnd);
    };
  }, [ref, action]);
};

export const TouchControls = () => {
  const leftRef    = useRef<HTMLButtonElement>(null);
  const rightRef   = useRef<HTMLButtonElement>(null);
  const jumpRef    = useRef<HTMLButtonElement>(null);
  const interactRef = useRef<HTMLButtonElement>(null);

  useTouchButton(leftRef,     'left');
  useTouchButton(rightRef,    'right');
  useTouchButton(jumpRef,     'jump');
  useTouchButton(interactRef, 'interact');

  return (
    <div className="touch-controls">
      <div className="touch-controls__dpad">
        <button ref={leftRef}  className="touch-btn touch-btn--left"  aria-label="Left">◀</button>
        <button ref={rightRef} className="touch-btn touch-btn--right" aria-label="Right">▶</button>
      </div>
      <div className="touch-controls__actions">
        <button ref={interactRef} className="touch-btn touch-btn--interact" aria-label="Interact">E</button>
        <button ref={jumpRef}     className="touch-btn touch-btn--jump"     aria-label="Jump">▲</button>
      </div>
    </div>
  );
};
