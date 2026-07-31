import { useContext } from 'react';
import { AlertasRiesgoListContext } from '@application-tutorias/acompanamiento/alertas/context/AlertasRiesgoListContext';

export const useAlertasRiesgoListContext = () => {
  const context = useContext(AlertasRiesgoListContext);
  if (!context) {
    throw new Error('useAlertasRiesgoListContext debe usarse dentro de AlertasRiesgoListProvider');
  }
  return context;
};
