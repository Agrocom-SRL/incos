/**
 * Conector: panel de acompañamiento (ACA) — provider + página.
 * Punto de entrada lazy de la ruta ACA-PANEL (/academico/acompanamiento/panel).
 */

import { PanelAcompanamientoProvider } from '@application-academico/acompanamiento/panel/providers/PanelAcompanamientoProvider';
import PanelAcompanamientoPage from '@academico/acompanamiento/panel/pages/PanelAcompanamientoPage';

const PanelAcompanamientoConnector = () => (
  <PanelAcompanamientoProvider>
    <PanelAcompanamientoPage />
  </PanelAcompanamientoProvider>
);

export default PanelAcompanamientoConnector;
