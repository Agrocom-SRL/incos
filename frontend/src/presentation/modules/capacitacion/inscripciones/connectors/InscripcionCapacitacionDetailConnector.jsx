/**
 * Conector: ficha de inscripción de capacitación (CAP) — provider (id de la
 * URL) + página. Ruta CAP-INSCRIPCIONES-DETALLE (/capacitacion/inscripciones/:id).
 */

import { useParams } from 'react-router-dom';
import { InscripcionCapacitacionDetailProvider } from '@application-capacitacion/inscripciones/providers/InscripcionCapacitacionDetailProvider';
import InscripcionCapacitacionDetail from '@capacitacion/inscripciones/pages/InscripcionCapacitacionDetail';

const InscripcionCapacitacionDetailConnector = () => {
  const { id } = useParams();
  return (
    <InscripcionCapacitacionDetailProvider inscripcionId={id}>
      <InscripcionCapacitacionDetail />
    </InscripcionCapacitacionDetailProvider>
  );
};

export default InscripcionCapacitacionDetailConnector;
