/**
 * Conector: edición de trámite de pasantía (TIT) — provider + página en modo
 * edit. Punto de entrada lazy de la ruta /titulacion/pasantias/:id/editar.
 */

import { useParams } from 'react-router-dom';
import { PasantiaFormProvider } from '@application-titulacion/pasantias/providers/PasantiaFormProvider';
import PasantiaFormPage from '@titulacion/pasantias/pages/PasantiaFormPage';

const PasantiaFormEditConnector = () => {
  const { id } = useParams();

  return (
    <PasantiaFormProvider pasantiaId={id}>
      <PasantiaFormPage mode="edit" />
    </PasantiaFormProvider>
  );
};

export default PasantiaFormEditConnector;
