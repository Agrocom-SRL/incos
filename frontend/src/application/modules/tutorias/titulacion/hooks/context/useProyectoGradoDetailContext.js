import { useContext } from 'react';
import { ProyectoGradoDetailContext } from '@application-tutorias/titulacion/context/ProyectoGradoDetailContext';

export const useProyectoGradoDetailContext = () => {
  const context = useContext(ProyectoGradoDetailContext);
  if (!context) {
    throw new Error('useProyectoGradoDetailContext debe usarse dentro de ProyectoGradoDetailProvider');
  }
  return context;
};
