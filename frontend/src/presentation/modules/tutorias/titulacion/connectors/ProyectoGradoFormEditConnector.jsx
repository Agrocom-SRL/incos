/**
 * Conector: edición de proyecto de grado (TUT) — provider + página en modo edit.
 * Punto de entrada lazy de la ruta /tutorias/titulacion/:id/editar.
 */

import { useParams } from 'react-router-dom';
import { ProyectoGradoFormProvider } from '@application-tutorias/titulacion/providers/ProyectoGradoFormProvider';
import ProyectoGradoFormPage from '@tutorias/titulacion/pages/ProyectoGradoFormPage';

const ProyectoGradoFormEditConnector = () => {
  const { id } = useParams();

  return (
    <ProyectoGradoFormProvider proyectoId={id}>
      <ProyectoGradoFormPage mode="edit" />
    </ProyectoGradoFormProvider>
  );
};

export default ProyectoGradoFormEditConnector;
