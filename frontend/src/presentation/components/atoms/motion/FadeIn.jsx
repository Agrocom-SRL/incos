/**
 * FadeIn — átomo de entrada fade + translateY.
 *
 * Usado para DetailSection del Drawer, items de listas, secciones de página.
 * Respeta reduced-motion: si es true, solo opacity (sin transform).
 *
 * @module presentation/components/atoms/motion/FadeIn
 * @param {{
 *   children: React.ReactNode,
 *   delay?: number,       // delay en segundos
 *   y?: number,           // desplazamiento inicial en px (default 8)
 *   as?: string,          // tag HTML (default 'div')
 *   className?: string,
 *   style?: object,
 * }} props
 */
import { motion } from 'motion/react';
import { useReducedMotion } from '@presentation/hooks/useReducedMotion';
import { DUR, EASE } from '../../../motion/presets';

const FadeIn = ({ children, delay = 0, y = 8, as = 'div', className, style }) => {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.div;

  return (
    <Tag
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.base, ease: EASE.out, delay: reduce ? 0 : delay }}
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
};

export default FadeIn;
