import { useContext } from 'react';
import { SeguridadUsuarioCreatePageContext } from '@/application/modules/seguridad/context/SeguridadUsuarioCreatePageContext';

export const useSeguridadUsuarioCreatePageContext = () => {
  const context = useContext(SeguridadUsuarioCreatePageContext);
  if (!context) {
    throw new Error('useSeguridadUsuarioCreatePageContext debe usarse dentro de SeguridadUsuarioCreateProvider');
  }
  return context;
};
