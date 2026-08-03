import { useContext } from 'react';
import { PanelAcompanamientoContext } from '@application-academico/acompanamiento/panel/context/PanelAcompanamientoContext';

export const usePanelAcompanamientoContext = () => {
  const context = useContext(PanelAcompanamientoContext);
  if (!context) {
    throw new Error('usePanelAcompanamientoContext debe usarse dentro de PanelAcompanamientoProvider');
  }
  return context;
};
