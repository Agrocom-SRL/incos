// modules/matricula/registro/connectors/InscripcionesNuevaConnector.jsx
/**
 * Conector: Nexo entre la Vista (Page) y la Lógica de Negocio (Provider)
 * 
 * Single Responsibility: Solo envuelve la página de inscripción nueva con su Provider específico
 * 
 * Este patrón permite:
 * - Separación clara: Conectores vs Páginas
 * - Carga lazy del Provider solo cuando se necesita
 * - Arquitectura modular: cada módulo gestiona sus propios conectores
 * 
 * Estructura de providers:
 * - InscripcionesProvider: Provider global del módulo (estado compartido)
 * - InscripcionesNuevaProvider: Provider específico para la feature de inscripción nueva
 */

import { useLocation } from 'react-router-dom';
import { InscripcionesProvider, InscripcionesNuevaProvider } from '@application-matricula/registro/providers';
import InscripcionesNueva from '@matricula/registro/pages/InscripcionesNueva';

const InscripcionesNuevaConnector = () => {
  const location = useLocation();
  // Obtener datos del estado de navegación
  // Puede venir desde EstudiantesDetail (studentId) o desde InscripcionesList (modo editar)
  const studentId = location.state?.studentId || null;
  const editData = location.state?.mode === 'editar' ? {
    inscripcionId: location.state.inscripcionId,
    studentId: location.state.studentId,
    carreraId: location.state.carreraId,
    periodoId: location.state.periodoId,
    paraleloId: location.state.paraleloId,
    tipoInscripcion: location.state.tipoInscripcion,
    selectedPeriodIds: location.state.selectedPeriodIds ?? null,
    materiaIdsByPeriod: location.state.materiaIdsByPeriod ?? null,
    parallelIdsByPeriod: location.state.parallelIdsByPeriod ?? null,
  } : null;

  return (
    <InscripcionesProvider>
      <InscripcionesNuevaProvider 
        studentId={studentId}
        editData={editData}
        mode={location.state?.mode || 'nuevo'}
      >
        <InscripcionesNueva />
      </InscripcionesNuevaProvider>
    </InscripcionesProvider>
  );
};

export default InscripcionesNuevaConnector;
