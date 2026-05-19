import { Grid } from 'antd';

/**
 * Layout responsivo de los botones de acción (dirección y tamaño).
 */
export function useTableActionsLayout() {
  const screens = Grid.useBreakpoint();
  const isSmall = !screens.lg;

  return {
    isSmall,
    actionsDirection: isSmall ? 'vertical' : 'horizontal',
    actionsSize: isSmall ? 'small' : 'middle',
  };
}
