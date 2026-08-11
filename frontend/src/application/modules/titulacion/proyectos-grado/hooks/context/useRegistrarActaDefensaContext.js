import { useContext } from 'react';
import { RegistrarActaDefensaContext } from '@application-titulacion/proyectos-grado/context/RegistrarActaDefensaContext';

export const useRegistrarActaDefensaContext = () => {
  const context = useContext(RegistrarActaDefensaContext);
  if (!context) {
    throw new Error(
      'useRegistrarActaDefensaContext debe usarse dentro de RegistrarActaDefensaProvider'
    );
  }
  return context;
};
