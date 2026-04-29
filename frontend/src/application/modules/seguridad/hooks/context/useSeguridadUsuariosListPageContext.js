import { useContext } from 'react';
import { SeguridadUsuariosListPageContext } from '@/application/modules/seguridad/context/SeguridadUsuariosListPageContext';

export const useSeguridadUsuariosListPageContext = () => {
  const context = useContext(SeguridadUsuariosListPageContext);
  if (!context) {
    throw new Error('useSeguridadUsuariosListPageContext debe usarse dentro de SeguridadUsuariosListProvider');
  }
  return context;
};
