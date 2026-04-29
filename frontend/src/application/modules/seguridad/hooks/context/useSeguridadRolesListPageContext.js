import { useContext } from 'react';
import { SeguridadRolesListPageContext } from '@/application/modules/seguridad/context/SeguridadRolesListPageContext';

export const useSeguridadRolesListPageContext = () => {
  const context = useContext(SeguridadRolesListPageContext);
  if (!context) {
    throw new Error('useSeguridadRolesListPageContext debe usarse dentro de SeguridadRolesListProvider');
  }
  return context;
};
