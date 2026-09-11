import { useState, useEffect } from 'react';

/**
 * Custom hook to smoothly count up from 0 to a target value using requestAnimationFrame.
 * Uses ease-out cubic for a fluid, natural deceleration effect.
 *
 * @param {number} target - The destination number to animate to
 * @param {number} duration - Animation duration in ms (default: 800ms)
 * @param {number} decimals - Number of decimal places (default: 0)
 * @param {any} triggerKey - Optional trigger key (like village.id) to restart count-up from 0
 * @returns {string|number} The animated display value
 */
export function useCountUp(target, duration = 800, decimals = 0, triggerKey = null) {
  const targetNum = Number(target) || 0;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let animationFrameId;
    let startTimestamp = null;
    const startVal = 0;
    const endVal = targetNum;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease-out cubic: 1 - (1 - t)^3
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * easeProgress;

      setDisplayValue(Number(current.toFixed(decimals)));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(endVal);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [targetNum, duration, decimals, triggerKey]);

  return decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue);
}
