/**
 * Conector: panel de acompañamiento (TUT) — provider + página.
 * Punto de entrada lazy de la ruta TUT-PANEL (/tutorias/acompanamiento/panel).
 */

import { PanelAcompanamientoProvider } from '@application-academico/acompanamiento/panel/providers/PanelAcompanamientoProvider';
import PanelAcompanamientoPage from '@academico/acompanamiento/panel/pages/PanelAcompanamientoPage';

const PanelAcompanamientoConnector = () => (
  <PanelAcompanamientoProvider>
    <PanelAcompanamientoPage />
  </PanelAcompanamientoProvider>
);

export default PanelAcompanamientoConnector;
