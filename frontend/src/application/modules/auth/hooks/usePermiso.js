import { useAuth } from './useAuth.js';

export const usePermiso = (codigo, accion) => {
  const { hasPermiso } = useAuth();
  return hasPermiso(codigo, accion);
};
