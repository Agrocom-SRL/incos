import { useContext } from 'react';
import { ProyectoGradoFormContext } from '@application-titulacion/proyectos-grado/context/ProyectoGradoFormContext';

export const useProyectoGradoFormContext = () => {
  const context = useContext(ProyectoGradoFormContext);
  if (!context) {
    throw new Error('useProyectoGradoFormContext debe usarse dentro de ProyectoGradoFormProvider');
  }
  return context;
};
