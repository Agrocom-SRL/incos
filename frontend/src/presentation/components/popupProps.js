/**
 * Props compartidos para popups de Ant Design (Dropdown/Select/Tooltip).
 * Promovido desde modules/matricula-v2/theme/popupClass.js para uso global.
 * mv2 re-importa desde aquí para mantener una sola fuente.
 *
 * @module presentation/components/popupProps
 */

/** Clase CSS aplicada al root de popups portados a document.body */
export const APP_POPUP_CLASS = 'app-ant-popup';

/** Props para Dropdown (Ant Design 6+) */
export const dropdownPopupProps = {
  classNames: {
    root: APP_POPUP_CLASS,
  },
};

/** Props para Select (Ant Design 6+) */
export const selectPopupProps = {
  classNames: {
    popup: {
      root: APP_POPUP_CLASS,
    },
  },
};
