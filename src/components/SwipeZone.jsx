/**
 * @file SwipeZone.jsx
 * @description Zona táctil invisible que detecta el deslizamiento del dedo
 * y lo convierte en un comando de dirección para la serpiente.
 *
 * Umbral mínimo de 25px para evitar clicks accidentales.
 * Ignora el eje dominante para mayor precisión.
 */

import { useRef, useCallback } from "react";

const MIN_SWIPE = 25; // px mínimos para reconocer un swipe

export default function SwipeZone({ onSwipe, className = "" }) {
  const startRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    const t = e.touches[0];
    startRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (!startRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - startRef.current.x;
    const dy = t.clientY - startRef.current.y;
    startRef.current = null;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Descartar si el movimiento es demasiado pequeño
    if (absDx < MIN_SWIPE && absDy < MIN_SWIPE) return;

    // Determinar eje dominante
    if (absDx > absDy) {
      onSwipe(dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
    } else {
      onSwipe(dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
    }
  }, [onSwipe]);

  // Prevenir scroll de la página SOLO dentro de esta zona
  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
  }, []);

  return (
    <div
      className={`swipe-zone ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      aria-label="Zona de control táctil — desliza para mover la serpiente"
      role="region"
    />
  );
}
