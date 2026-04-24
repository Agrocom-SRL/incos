import { useAuthContext } from '@application-auth';
import Button from './Button';

/**
 * Boton condicional por permiso.
 * Si no tiene permiso+accion, no renderiza nada.
 */
export function ActionButton({ permiso, accion, children, ...buttonProps }) {
  const { hasPermiso } = useAuthContext();

  if (!hasPermiso(permiso, accion)) return null;

  return <Button {...buttonProps}>{children}</Button>;
}

export default ActionButton;
