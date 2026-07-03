/**
 * Connector del detalle de Historial académico (lazy).
 * Ensambla el Provider (contexto) + la página.
 */

import { HistorialAcademicoProvider } from '@application-academico/historial/providers/HistorialAcademicoProvider.jsx';
import HistorialAcademicoPage from '../pages/HistorialAcademicoPage.jsx';

const HistorialAcademicoConnector = () => (
  <HistorialAcademicoProvider>
    <HistorialAcademicoPage />
  </HistorialAcademicoProvider>
);

export default HistorialAcademicoConnector;
