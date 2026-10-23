/**
 * Conector: alta de curso de capacitación (CAP) — provider + página en modo create.
 * Punto de entrada lazy de la ruta CAP-CURSOS-REGISTRAR (/capacitacion/cursos/registrar).
 *
 * «Nueva edición»: si llega `location.state.cursoOrigenId`, el provider carga esa oferta y el
 * formulario se precarga con su copia (fechas y edición en blanco).
 */

import { useLocation } from 'react-router-dom';
import { CursoCapacitacionFormProvider } from '@application-capacitacion/cursos/providers/CursoCapacitacionFormProvider';
import CursoCapacitacionFormPage from '@capacitacion/cursos/pages/CursoCapacitacionFormPage';

const CursoCapacitacionFormCreateConnector = () => {
  const location = useLocation();
  return (
    <CursoCapacitacionFormProvider cursoId={location.state?.cursoOrigenId ?? null}>
      <CursoCapacitacionFormPage mode="create" />
    </CursoCapacitacionFormProvider>
  );
};

export default CursoCapacitacionFormCreateConnector;
