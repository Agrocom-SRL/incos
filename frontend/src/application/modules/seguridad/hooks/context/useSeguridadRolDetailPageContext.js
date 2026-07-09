import { useContext } from 'react';
import { SeguridadRolDetailPageContext } from '@/application/modules/seguridad/context/SeguridadRolDetailPageContext';

export const useSeguridadRolDetailPageContext = () => {
  const context = useContext(SeguridadRolDetailPageContext);
  if (!context) {
    throw new Error('useSeguridadRolDetailPageContext debe usarse dentro de SeguridadRolDetailProvider');
  }
  return context;
};
