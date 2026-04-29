import { useContext } from 'react';
import { SeguridadUsuarioPermisosPageContext } from '@/application/modules/seguridad/context/SeguridadUsuarioPermisosPageContext';

export const useSeguridadUsuarioPermisosPageContext = () => {
  const context = useContext(SeguridadUsuarioPermisosPageContext);
  if (!context) {
    throw new Error('useSeguridadUsuarioPermisosPageContext debe usarse dentro de SeguridadUsuarioPermisosProvider');
  }
  return context;
};
