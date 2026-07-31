/**
 * Conector: ficha de sesión de refuerzo (TUT) — provider (id de la URL)
 * + página. Punto de entrada lazy de la ruta TUT-SESIONES-DETALLE
 * (/tutorias/acompanamiento/sesiones/:id).
 */

import { useParams } from 'react-router-dom';
import { SesionRefuerzoDetailProvider } from '@application-academico/acompanamiento/sesiones/providers/SesionRefuerzoDetailProvider';
import SesionRefuerzoDetail from '@academico/acompanamiento/sesiones/pages/SesionRefuerzoDetail';

const SesionRefuerzoDetailConnector = () => {
  const { id } = useParams();
  return (
    <SesionRefuerzoDetailProvider sesionId={id}>
      <SesionRefuerzoDetail />
    </SesionRefuerzoDetailProvider>
  );
};

export default SesionRefuerzoDetailConnector;
