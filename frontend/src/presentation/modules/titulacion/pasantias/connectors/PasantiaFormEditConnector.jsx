/**
 * Conector: edición de trámite de pasantía (TUT) — provider + página en modo
 * edit. Punto de entrada lazy de la ruta /tutorias/pasantias/:id/editar.
 */

import { useParams } from 'react-router-dom';
import { PasantiaFormProvider } from '@application-tutorias/pasantias/providers/PasantiaFormProvider';
import PasantiaFormPage from '@tutorias/pasantias/pages/PasantiaFormPage';

const PasantiaFormEditConnector = () => {
  const { id } = useParams();

  return (
    <PasantiaFormProvider pasantiaId={id}>
      <PasantiaFormPage mode="edit" />
    </PasantiaFormProvider>
  );
};

export default PasantiaFormEditConnector;
