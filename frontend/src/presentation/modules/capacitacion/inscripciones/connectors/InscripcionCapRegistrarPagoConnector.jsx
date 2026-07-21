/**
 * Conector: "Registrar pago" de una inscripción de capacitación (CAP) — mismo
 * provider que la ficha (id de la URL) + página. Ruta
 * CAP-INSCRIPCIONES-PAGO-REGISTRAR (/capacitacion/inscripciones/:id/pagos/registrar).
 */

import { useParams } from 'react-router-dom';
import { InscripcionCapacitacionDetailProvider } from '@application-capacitacion/inscripciones/providers/InscripcionCapacitacionDetailProvider';
import InscripcionCapRegistrarPagoPage from '@capacitacion/inscripciones/pages/InscripcionCapRegistrarPagoPage';

const InscripcionCapRegistrarPagoConnector = () => {
  const { id } = useParams();
  return (
    <InscripcionCapacitacionDetailProvider inscripcionId={id}>
      <InscripcionCapRegistrarPagoPage />
    </InscripcionCapacitacionDetailProvider>
  );
};

export default InscripcionCapRegistrarPagoConnector;
