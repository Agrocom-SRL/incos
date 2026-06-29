import { useContext } from 'react';
import { PerfilPageContext } from '@/application/modules/perfil/context/PerfilPageContext';

export const usePerfilPageContext = () => {
  const context = useContext(PerfilPageContext);
  if (!context) {
    throw new Error('usePerfilPageContext debe usarse dentro de PerfilPageProvider');
  }
  return context;
};
