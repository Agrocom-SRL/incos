/**
 * Consumidor del contexto de auth + alias históricos (user, loading).
 */
import { useAuth } from '../useAuth.js';

export const useAuthContext = () => {
  const ctx = useAuth();
  return {
    ...ctx,
    user: ctx.usuario,
    loading: ctx.isLoading,
  };
};
