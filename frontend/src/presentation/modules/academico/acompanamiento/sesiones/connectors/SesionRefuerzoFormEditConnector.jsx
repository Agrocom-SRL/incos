/**
 * Conector: edición de sesión de refuerzo (TUT) — provider (id de la URL)
 * + página en modo edit. Ruta TUT-SESIONES-EDITAR
 * (/tutorias/acompanamiento/sesiones/:id/editar).
 */

import { useParams } from 'react-router-dom';
import { SesionRefuerzoFormProvider } from '@application-academico/acompanamiento/sesiones/providers/SesionRefuerzoFormProvider';
import SesionRefuerzoFormPage from '@academico/acompanamiento/sesiones/pages/SesionRefuerzoFormPage';

const SesionRefuerzoFormEditConnector = () => {
  const { id } = useParams();
  return (
    <SesionRefuerzoFormProvider sesionId={id}>
      <SesionRefuerzoFormPage mode="edit" />
    </SesionRefuerzoFormProvider>
  );
};

export default SesionRefuerzoFormEditConnector;
