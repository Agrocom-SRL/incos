/**
 * Conector: «Editar pago» de una inscripción de capacitación (CAP) — mismo provider
 * que la ficha (id de la URL) + página. Ruta CAP-INSCRIPCIONES-PAGO-EDITAR
 * (/capacitacion/inscripciones/:id/pagos/:pagoId/editar).
 */

import { useParams } from 'react-router-dom';
import { InscripcionCapacitacionDetailProvider } from '@application-capacitacion/inscripciones/providers/InscripcionCapacitacionDetailProvider';
import InscripcionCapEditarPagoPage from '@capacitacion/inscripciones/pages/InscripcionCapEditarPagoPage';

const InscripcionCapEditarPagoConnector = () => {
  const { id } = useParams();
  return (
    <InscripcionCapacitacionDetailProvider inscripcionId={id}>
      <InscripcionCapEditarPagoPage />
    </InscripcionCapacitacionDetailProvider>
  );
};

export default InscripcionCapEditarPagoConnector;
