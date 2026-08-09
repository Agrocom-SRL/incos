/**
 * Layout compartido de los Drawers de Nivelación (`EventoHistorialDrawer`,
 * `ResultadoNivelacionDrawer`). Copia de
 * `calificaciones/utils/calificacionesDrawerLayout.js` con prefijo `niv-`
 * (documento de diseño B0) — mismo contrato de `Drawer.classNames`/`styles`,
 * shell propio (no depende de que `calificaciones.css` esté cargado).
 *
 * Ant Design 6: `rootClassName` → div.ant-drawer (portal, inset:0).
 * `className` → .ant-drawer-section (panel). Los estilos de posición van en `styles.wrapper`.
 */

export const NIVELACION_DRAWER_Z_INDEX = 1100;

/** Clase en el nodo raíz del portal (.ant-drawer) */
export const nivelacionDrawerRootClassName = 'niv-ajustes-drawer';

/** Clase en el panel (.ant-drawer-section) */
export const nivelacionDrawerSectionClassName = 'niv-ajustes-drawer__section';

/** Tarjeta de sección (blanca, borde suave). */
export const nivelacionDrawerTarjetaClassName = 'niv-ajustes-drawer__override-card';

export const nivelacionDrawerClassNames = {
  root: nivelacionDrawerRootClassName,
  section: nivelacionDrawerSectionClassName,
};

/** @returns {import('antd').DrawerProps['styles']} */
export const nivelacionDrawerStyles = () => ({
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
