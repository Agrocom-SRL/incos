/** Clase para popups de Ant Design (Select/Dropdown) portados a `document.body`. */
export const MV2_POPUP_CLASS = 'matricula-v2-ant-popup';

/** Props compartidos para Select dentro del módulo v2 (Ant Design 6+). */
export const mv2SelectPopupProps = {
  classNames: {
    popup: {
      root: MV2_POPUP_CLASS,
    },
  },
};

/** Props compartidos para Dropdown dentro del módulo v2 (Ant Design 6+). */
export const mv2DropdownPopupProps = {
  classNames: {
    root: MV2_POPUP_CLASS,
  },
};

/** Props compartidos para Tooltip (Ant Design 6+). */
const mv2TooltipContainerStyle = {
  background: 'var(--tooltip-bg)',
  color: 'var(--tooltip-fg)',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1.35,
  textAlign: 'center',
  borderRadius: 8,
  padding: '6px 12px',
  border: '1px solid var(--tooltip-border)',
  boxShadow: 'var(--shadow-md)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 28,
  boxSizing: 'border-box',
};

/** Props compartidos para Tooltip (Ant Design 6+: estilos en `container`, no `inner`). */
export const mv2TooltipProps = {
  classNames: {
    root: 'matricula-v2-tooltip',
    container: 'matricula-v2-tooltip__container',
  },
  styles: {
    container: mv2TooltipContainerStyle,
  },
};
