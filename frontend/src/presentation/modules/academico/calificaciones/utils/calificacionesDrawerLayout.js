/**
 * Layout compartido de drawers en calificaciones (cuaderno + consolidado).
 *
 * Ant Design 6: `rootClassName` → div.ant-drawer (portal, inset:0).
 * `className` → .ant-drawer-section (panel). Los estilos de posición van en `styles.wrapper`.
 */

export const CALIFICACIONES_DRAWER_Z_INDEX = 1100;

/** Clase en el nodo raíz del portal (.ant-drawer) */
export const calificacionesDrawerRootClassName = 'cal-ajustes-drawer';

/** Clase en el panel (.ant-drawer-section) */
export const calificacionesDrawerSectionClassName = 'cal-ajustes-drawer__section';

/** Tarjeta de sección (blanca, borde suave) — evaluación y ajustes del curso */
export const calificacionesDrawerTarjetaClassName = 'cal-ajustes-drawer__override-card';

export const calificacionesDrawerClassNames = {
  root: calificacionesDrawerRootClassName,
  section: calificacionesDrawerSectionClassName,
};

/** @returns {import('antd').DrawerProps['styles']} */
export const calificacionesDrawerStyles = () => ({
  wrapper: {
    top: 'var(--header-height, 64px)',
    bottom: 0,
    height: 'auto',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  body: {
    flex: 1,
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    minHeight: 0,
  },
  footer: {
    flexShrink: 0,
  },
});
