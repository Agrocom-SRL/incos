/**
 * Grilla de tarjetas de estudiante con entrada en stagger (jerarquiza la carga y
 * evita el cambio brusco al filtrar). Respeta reduced-motion vía MotionConfig
 * (layout) + variants que sólo animan opacity en ese caso.
 * @param {{ students: object[], onOpen: (s) => void, onEdit: (s) => void }} props
 */
import { motion } from 'motion/react';
import StudentCard from './StudentCard';
import { useReducedMotion } from '../hooks/useReducedMotion';

// Alias capitalizado: el linter cuenta el uso JSX por identificador, no por `motion.div`.
const MotionDiv = motion.div;

const StudentCardGrid = ({ students, onOpen, onEdit }) => {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.05, delayChildren: reduce ? 0 : 0.03 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.28, ease: [0.23, 1, 0.32, 1] },
    },
  };

  return (
    <MotionDiv
      className="matricula-v2-grid"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {students.map((s) => (
        <MotionDiv key={s.id} variants={item} style={{ minWidth: 0 }}>
          <StudentCard student={s} onOpen={() => onOpen(s)} onEdit={() => onEdit(s)} />
        </MotionDiv>
      ))}
    </MotionDiv>
  );
};

export default StudentCardGrid;
