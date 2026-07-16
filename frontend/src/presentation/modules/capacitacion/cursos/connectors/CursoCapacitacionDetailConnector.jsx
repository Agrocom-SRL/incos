/**
 * Conector: ficha de curso de capacitación (CAP) — provider (id de la URL) + página.
 * Punto de entrada lazy de la ruta CAP-CURSOS-DETALLE (/capacitacion/cursos/:id).
 */

import { useParams } from 'react-router-dom';
import { CursoCapacitacionDetailProvider } from '@application-capacitacion/cursos/providers/CursoCapacitacionDetailProvider';
import CursoCapacitacionDetail from '@capacitacion/cursos/pages/CursoCapacitacionDetail';

const CursoCapacitacionDetailConnector = () => {
  const { id } = useParams();
  return (
    <CursoCapacitacionDetailProvider cursoId={id}>
      <CursoCapacitacionDetail />
    </CursoCapacitacionDetailProvider>
  );
};

export default CursoCapacitacionDetailConnector;
