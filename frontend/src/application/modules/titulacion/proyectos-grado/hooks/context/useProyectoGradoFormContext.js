import { useContext } from 'react';
import { ProyectoGradoFormContext } from '@application-tutorias/titulacion/context/ProyectoGradoFormContext';

export const useProyectoGradoFormContext = () => {
  const context = useContext(ProyectoGradoFormContext);
  if (!context) {
    throw new Error('useProyectoGradoFormContext debe usarse dentro de ProyectoGradoFormProvider');
  }
  return context;
};
