/**
 * Stagger — contenedor de entrada escalonada para grillas y listas.
 *
 * Uso:
 *   <Stagger>
 *     {items.map(i => <Stagger.Item key={i.id}><Card /></Stagger.Item>)}
 *   </Stagger>
 *
 * El contenedor aplica staggerChildren; cada Item anima fade+y.
 * Reduced-motion: solo opacity (sin transform), stagger desactivado.
 *
 * @module presentation/components/atoms/motion/Stagger
 */
import { motion } from 'motion/react';
import { useReducedMotion } from '@presentation/hooks/useReducedMotion';
import { DUR, EASE, STAGGER } from '../../../motion/presets';

// Alias capitalizados (linter JSX)
const MotionDiv = motion.div;

/**
 * @param {{
 *   children: React.ReactNode,
 *   as?: string,          // tag HTML del contenedor (default 'div')
 *   className?: string,
 *   style?: object,
 * }} props
 */
const StaggerContainer = ({ children, as = 'div', className, style, ...rest }) => {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.div;

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : STAGGER.children,
        delayChildren: reduce ? 0 : STAGGER.delay,
      },
    },
  };

  return (
    <Tag
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </Tag>
  );
};

/**
 * Item del contenedor Stagger. Anima fade+y individualmente.
 *
 * @param {{
 *   children: React.ReactNode,
 *   className?: string,
 *   style?: object,
 * }} props
 */
function StaggerItem({ children, className, style }) {
  const reduce = useReducedMotion();

  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: DUR.base, ease: EASE.out },
    },
  };

  return (
    <MotionDiv variants={item} className={className} style={style}>
      {children}
    </MotionDiv>
  );
}

// Composición via static property (patrón Compound Component)
StaggerContainer.Item = StaggerItem;

export default StaggerContainer;
