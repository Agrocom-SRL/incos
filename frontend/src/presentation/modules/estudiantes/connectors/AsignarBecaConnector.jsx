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
import { StudentProvider, StudentDetailProvider } from '@application-estudiantes/providers';
import EstudiantesAsignarBeca from '@estudiantes/pages/EstudiantesAsignarBeca';

const AsignarBecaConnector = () => {
  const location = useLocation();
  const studentId = location.state?.studentId || null;

  // Siempre proporcionar ambos providers
  // Si no hay studentId, el StudentDetailProvider manejará el caso sin cargar datos
  // pero el hook siempre estará disponible
  return (
    <StudentProvider>
      <StudentDetailProvider studentId={studentId}>
        <EstudiantesAsignarBeca />
      </StudentDetailProvider>
    </StudentProvider>
  );
};

export default AsignarBecaConnector;
