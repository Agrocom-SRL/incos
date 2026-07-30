/**
 * Conector: edición de empresa del catálogo de pasantías (TUT) — provider +
 * página en modo edit. Punto de entrada lazy de la ruta
 * /tutorias/pasantias/empresas/:empresaId/editar.
 */

import { useParams } from 'react-router-dom';
import { PasantiaEmpresaFormProvider } from '@application-tutorias/pasantias/providers/PasantiaEmpresaFormProvider';
import PasantiaEmpresaFormPage from '@tutorias/pasantias/pages/PasantiaEmpresaFormPage';

const PasantiaEmpresaFormEditConnector = () => {
  const { empresaId } = useParams();

  return (
    <PasantiaEmpresaFormProvider empresaId={empresaId}>
      <PasantiaEmpresaFormPage mode="edit" />
    </PasantiaEmpresaFormProvider>
  );
};

export default PasantiaEmpresaFormEditConnector;
