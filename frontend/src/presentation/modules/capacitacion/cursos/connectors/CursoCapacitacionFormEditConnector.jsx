/**
 * Conector: edición de curso de capacitación (CAP) — provider (id de la URL) +
 * página en modo edit. Ruta CAP-CURSOS-EDITAR (/capacitacion/cursos/:id/editar).
 */

import { useParams } from 'react-router-dom';
import { CursoCapacitacionFormProvider } from '@application-capacitacion/cursos/providers/CursoCapacitacionFormProvider';
import CursoCapacitacionFormPage from '@capacitacion/cursos/pages/CursoCapacitacionFormPage';

const CursoCapacitacionFormEditConnector = () => {
  const { id } = useParams();
  return (
    <CursoCapacitacionFormProvider cursoId={id}>
      <CursoCapacitacionFormPage mode="edit" />
    </CursoCapacitacionFormProvider>
  );
};

export default CursoCapacitacionFormEditConnector;
