/**
 * Conector: ficha-hub de proyecto de grado (TIT) — provider + página.
 * Punto de entrada lazy de la ruta /titulacion/proyectos-grado/:id.
 */

import { useParams } from 'react-router-dom';
import { ProyectoGradoDetailProvider } from '@application-titulacion/proyectos-grado/providers/ProyectoGradoDetailProvider';
import ProyectoGradoDetail from '@titulacion/proyectos-grado/pages/ProyectoGradoDetail';

const ProyectoGradoDetailConnector = () => {
  const { id } = useParams();

  return (
    <ProyectoGradoDetailProvider proyectoId={id}>
      <ProyectoGradoDetail />
    </ProyectoGradoDetailProvider>
  );
};

export default ProyectoGradoDetailConnector;
