import { useContext } from 'react';
import { SeguridadRolPermisosPageContext } from '@/application/modules/seguridad/context/SeguridadRolPermisosPageContext';

export const useSeguridadRolPermisosPageContext = () => {
  const context = useContext(SeguridadRolPermisosPageContext);
  if (!context) {
    throw new Error('useSeguridadRolPermisosPageContext debe usarse dentro de SeguridadRolPermisosProvider');
  }
  return context;
};
