// modules/dashboard/connectors/DashboardConnector.jsx
/**
 * Conector del Dashboard — elige la PÁGINA según el rol (dashboard por rol).
 *
 * Cada rol tiene su propia página a nivel de `dashboard/pages/` (mismo nivel que
 * el dashboard administrativo). El connector decide cuál montar:
 *   - ESTUDIANTE → `EstudianteDashboard` (su inicio personal, solo lectura).
 *   - Staff/admin → `Dashboard` (administrativo, con su `DashboardProvider`).
 * A futuro: DOCENTE → su propia página, agregando otra rama aquí.
 */

import { DashboardProvider } from '@application-dashboard';
import { useAuth, esEstudiante } from '@application-auth';
import Dashboard from '@dashboard/pages/Dashboard';
import EstudianteDashboard from '@dashboard/pages/EstudianteDashboard';

const DashboardConnector = () => {
  const { usuario } = useAuth();

  if (esEstudiante(usuario)) {
    return <EstudianteDashboard />;
  }

  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  );
};

export default DashboardConnector;
