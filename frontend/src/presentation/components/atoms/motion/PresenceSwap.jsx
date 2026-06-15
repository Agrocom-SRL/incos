/**
 * PresenceSwap — wrapper AnimatePresence para swaps de vistas/estados.
 *
 * Encapsula el patrón AnimatePresence mode="popLayout"|"wait" con variants
 * del preset. Cero literales de duración/easing en los consumidores.
 *
 * Uso:
 *   <PresenceSwap keyProp={viewMode} mode="popLayout">
 *     <div key={viewMode}>...</div>
 *   </PresenceSwap>
 *
 * O con children directos que ya llevan key:
 *   <PresenceSwap mode="wait" initial={false}>
 *     {selectedCount > 0 ? <BulkBar key="bulk" /> : <Actions key="actions" />}
 *   </PresenceSwap>
 *
 * @module presentation/components/atoms/motion/PresenceSwap
 * @param {{
 *   children: React.ReactNode,
 *   mode?: 'popLayout' | 'wait' | 'sync',
 *   initial?: boolean,
 *   keyProp?: string | number,   // si se quiere envolver en MotionDiv automático
 *   popLayout?: boolean,         // usa variants.presenceSwap (con scale)
 *   className?: string,
 *   style?: object,
 * }} props
 */
import { AnimatePresence, motion } from 'motion/react';
import { variants } from '../../../motion/presets';

const MotionDiv = motion.div;

const PresenceSwap = ({
  children,
  mode = 'wait',
  initial = false,
  keyProp,
  popLayout = false,
  className,
  style,
}) => {
  const vars = popLayout ? variants.presenceSwap : variants.presenceWait;

  // Si keyProp está definido, envolver en MotionDiv con los variants
  if (keyProp !== undefined) {
    return (
      <AnimatePresence mode={mode} initial={initial}>
        <MotionDiv
          key={keyProp}
          variants={vars}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={className}
          style={style}
        >
          {children}
        </MotionDiv>
      </AnimatePresence>
    );
  }

  // Sin keyProp: los children ya llevan key (ej. FilterToolbar)
  return (
    <AnimatePresence mode={mode} initial={initial}>
      {children}
    </AnimatePresence>
  );
};

export default PresenceSwap;
