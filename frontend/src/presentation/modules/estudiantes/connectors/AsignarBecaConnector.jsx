// modules/estudiantes/connectors/AsignarBecaConnector.jsx
/**
 * Conector: Nexo entre la Vista (Page) y la Lógica de Negocio (Provider)
 * 
 * Single Responsibility: Solo envuelve la página de asignación de beca con su Provider específico
 * 
 * Este patrón permite:
 * - Separación clara: Conectores vs Páginas
 * - Carga lazy del Provider solo cuando se necesita
 * - Arquitectura modular: cada módulo gestiona sus propios conectores
 * - Obtiene el studentId del estado de navegación y lo pasa al Provider si es necesario
 */

import { useLocation } from 'react-router-dom';
import { StudentProvider, StudentDetailProvider, AsignarBecaProvider } from '@application-estudiantes/providers';
import EstudiantesAsignarBeca from '@estudiantes/pages/EstudiantesAsignarBeca';

const AsignarBecaConnector = () => {
  const location = useLocation();
  const studentId = location.state?.studentId || null;
  // Obtener nombre del estudiante del estado si está disponible (para título dinámico)
  const studentName = location.state?.studentName || null;

  // Siempre proporcionar todos los providers necesarios
  // Si no hay studentId, los providers manejarán el caso sin cargar datos
  // pero los hooks siempre estarán disponibles
  return (
    <StudentProvider>
      <StudentDetailProvider studentId={studentId}>
        <AsignarBecaProvider studentId={studentId} studentName={studentName}>
          <EstudiantesAsignarBeca />
        </AsignarBecaProvider>
      </StudentDetailProvider>
    </StudentProvider>
  );
};

export default AsignarBecaConnector;
