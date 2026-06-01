import { AsignacionDocenteProvider } from '@application-institucional/horarios';
import AsignacionDocentePage from '../pages/AsignacionDocentePage';

const AsignacionDocenteConnector = () => (
  <AsignacionDocenteProvider>
    <AsignacionDocentePage />
  </AsignacionDocenteProvider>
);

export default AsignacionDocenteConnector;
