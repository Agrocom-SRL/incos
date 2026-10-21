/**
 * Estado de navegación del ítem «Grupos» hacia el ABM de horarios: al guardar o
 * pulsar «Volver» se regresa al tab «Horarios» de la misma pantalla.
 */

import {
  CAP_GRUPOS_MENU_KEY,
  GRUPOS_TAB_HORARIOS,
  grupoCapTabPath,
} from '@application-capacitacion/config/paths';

export const horariosNavigationState = () => ({
  returnListPath: grupoCapTabPath(GRUPOS_TAB_HORARIOS),
  menuSidebarKey: CAP_GRUPOS_MENU_KEY,
});
