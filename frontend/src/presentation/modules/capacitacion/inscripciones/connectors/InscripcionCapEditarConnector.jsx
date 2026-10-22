/**
 * Conector: «Editar inscripción» de capacitación (CAP) — mismo provider que la ficha
 * (id de la URL) + página. Ruta CAP-INSCRIPCIONES-EDITAR (/capacitacion/inscripciones/:id/editar).
 */

import { useParams } from 'react-router-dom';
import { InscripcionCapacitacionDetailProvider } from '@application-capacitacion/inscripciones/providers/InscripcionCapacitacionDetailProvider';
import InscripcionCapEditarPage from '@capacitacion/inscripciones/pages/InscripcionCapEditarPage';

const InscripcionCapEditarConnector = () => {
  const { id } = useParams();
  return (
    <InscripcionCapacitacionDetailProvider inscripcionId={id}>
      <InscripcionCapEditarPage />
    </InscripcionCapacitacionDetailProvider>
  );
};

export default InscripcionCapEditarConnector;
