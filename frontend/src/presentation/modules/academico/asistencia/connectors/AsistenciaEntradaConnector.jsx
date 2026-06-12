import ModuleEntryConnector from '@navigation/components/ModuleEntryConnector.jsx';
import CoordinacionAsistenciaPage from '../pages/CoordinacionAsistenciaPage.jsx';

/**
 * Entrada del ítem Asistencia (ACA-ASI). Resuelve el landingStack:
 *  - con permiso coordinación → CoordinacionAsistenciaPage inline (elegir docente)
 *  - solo docente → redirect a /academico/asistencia/mis-cursos
 */
const AsistenciaEntradaConnector = () => (
  <ModuleEntryConnector menuKey="ACA-ASI" inlineElement={<CoordinacionAsistenciaPage />} />
);

export default AsistenciaEntradaConnector;
