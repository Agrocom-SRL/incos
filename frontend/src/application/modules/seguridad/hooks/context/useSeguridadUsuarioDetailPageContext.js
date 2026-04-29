import { useContext } from 'react';
import { SeguridadUsuarioDetailPageContext } from '@/application/modules/seguridad/context/SeguridadUsuarioDetailPageContext';

export const useSeguridadUsuarioDetailPageContext = () => {
  const context = useContext(SeguridadUsuarioDetailPageContext);
  if (!context) {
    throw new Error('useSeguridadUsuarioDetailPageContext debe usarse dentro de SeguridadUsuarioDetailProvider');
  }
  return context;
};
