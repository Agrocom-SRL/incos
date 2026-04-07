import { usePermiso } from '@application-auth';

export function PermisoGuard({ codigo, accion, children, fallback = null }) {
  const tiene = usePermiso(codigo, accion);
  return tiene ? children : fallback;
}
