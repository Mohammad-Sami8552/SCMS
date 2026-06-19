import { useEffect, useRef } from 'react';

export default function useDraggable(elRef, handleRef) {
  const coords = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  useEffect(() => {
    const handle = handleRef.current;
    const element = elRef.current;
    if (!handle || !element) return;

    // Apply native hardware alignment values cleanly to absolute layout plane
    element.style.position = 'fixed';
    element.style.margin = '0';
    element.style.transform = 'translate(0px, 0px)';

    let startX = 0, startY = 0;

    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      const nextX = e.clientX - startX;
      const nextY = e.clientY - startY;

      coords.current = { x: nextX, y: nextY };
      // Direct high-speed hardware-accelerated style injection (Bypasses React lag)
      element.style.transform = `translate(${nextX}px, ${nextY}px)`;
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    const onMouseDown = (e) => {
      if (e.button !== 0) return; // Disregard right/scroll wheel click clicks
      if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'OPTION'].includes(e.target.tagName)) return;

      e.preventDefault();
      isDragging.current = true;
      
      startX = e.clientX - coords.current.x;
      startY = e.clientY - coords.current.y;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    handle.addEventListener('mousedown', onMouseDown);
    handle.style.cursor = 'move';

    return () => {
      handle.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [elRef, handleRef]);
}