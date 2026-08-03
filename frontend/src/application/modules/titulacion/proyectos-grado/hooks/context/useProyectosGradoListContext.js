import { useContext } from 'react';
import { ProyectosGradoListContext } from '@application-titulacion/proyectos-grado/context/ProyectosGradoListContext';

export const useProyectosGradoListContext = () => {
  const context = useContext(ProyectosGradoListContext);
  if (!context) {
    throw new Error('useProyectosGradoListContext debe usarse dentro de ProyectosGradoListProvider');
  }
  return context;
};
