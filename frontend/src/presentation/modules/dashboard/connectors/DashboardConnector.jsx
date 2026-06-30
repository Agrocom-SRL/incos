// modules/dashboard/connectors/DashboardConnector.jsx
/**
 * Conector: Nexo entre la Vista (Page) y la Lógica de Negocio (Provider)
 * 
 * Single Responsibility: Solo envuelve la página con su Provider específico
 * 
 * Este patrón permite:
 * - Separación clara: Conectores vs Páginas
 * - Carga lazy del Provider solo cuando se necesita
 * - Arquitectura modular: cada módulo gestiona sus propios conectores
 */

import { DashboardProvider } from '@application-dashboard';
import { useAuth, esEstudiante } from '@application-auth';
import Dashboard from '@dashboard/pages/Dashboard';
import { DashboardPageShell, EstudianteHomePanel } from '@dashboard/components/organisms';

/**
 * Role-aware (patrón docente CoordinacionPage→MisCursosPage):
 * - ESTUDIANTE → inicio del estudiante (no monta el provider de resumen admin).
 * - Staff → dashboard administrativo (sin cambios).
 */
const DashboardConnector = () => {
  const { usuario } = useAuth();

  if (esEstudiante(usuario)) {
    return (
      <DashboardPageShell>
        <EstudianteHomePanel />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  );
};

export default DashboardConnector;

