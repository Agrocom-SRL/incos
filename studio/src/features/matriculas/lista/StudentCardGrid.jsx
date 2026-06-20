/**
 * StudentCardGrid — grid de tarjetas con entrada en cascada (stagger).
 * Organismo LOCAL: mapea StudentCard usando los presets de motion compartidos.
 */
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@lib/motion/presets';
import { useReducedMotion } from '@lib/motion/useReducedMotion';
import { StudentCard } from './StudentCard';

const MotionDiv = motion.div;

export function StudentCardGrid({ rows, handlers }) {
  const reduce = useReducedMotion();
  return (
    <MotionDiv className="mat-grid" variants={reduce ? undefined : staggerContainer} initial="hidden" animate="visible">
      {rows.map((row) => (
        <MotionDiv key={row.id} variants={reduce ? undefined : staggerItem}>
          <StudentCard row={row} {...handlers} />
        </MotionDiv>
      ))}
    </MotionDiv>
  );
}

export default StudentCardGrid;
