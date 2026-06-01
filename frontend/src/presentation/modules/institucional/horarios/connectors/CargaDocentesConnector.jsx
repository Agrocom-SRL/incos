import { CargaDocentesProvider } from '@application-institucional/horarios';
import CargaDocentesDashboardPage from '../pages/CargaDocentesDashboardPage';

const CargaDocentesConnector = () => (
  <CargaDocentesProvider>
    <CargaDocentesDashboardPage />
  </CargaDocentesProvider>
);

export default CargaDocentesConnector;
