/**
 * Collapse — acordeón genérico via grid-template-rows (CSS puro, interrumpible).
 *
 * No usa motion/react — la animación es CSS transition (interrumpible,
 * off-main-thread). Este patrón es correcto per emil-design-eng para UI
 * que puede alternarse rápidamente. Consume tokens de motion --dur-pop / --ease-out.
 *
 * Uso:
 *   <Collapse open={isOpen}>
 *     <div>Contenido expansible</div>
 *   </Collapse>
 *
 * @module presentation/components/atoms/motion/Collapse
 * @param {{
 *   open: boolean,
 *   children: React.ReactNode,
 *   className?: string,
 * }} props
 */

const Collapse = ({ open, children, className }) => (
  <div
    className={`collapse-wrapper${open ? ' collapse-wrapper--open' : ''}${className ? ` ${className}` : ''}`}
    aria-hidden={!open}
  >
    <div className="collapse-wrapper__inner">{children}</div>
  </div>
);

export default Collapse;

/*
  CSS requerido (añadir a presentation/styles/base/motion-utilities.css):

  .collapse-wrapper {
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    transition:
      grid-template-rows var(--dur-pop, 200ms) var(--ease-out, cubic-bezier(0.23, 1, 0.32, 1)),
      opacity var(--dur-pop, 200ms) var(--ease-out, cubic-bezier(0.23, 1, 0.32, 1));
  }
  .collapse-wrapper--open {
    grid-template-rows: 1fr;
    opacity: 1;
  }
  .collapse-wrapper__inner {
    overflow: hidden;
    min-height: 0;
  }
  @media (prefers-reduced-motion: reduce) {
    .collapse-wrapper {
      transition-property: opacity !important;
    }
  }
*/
