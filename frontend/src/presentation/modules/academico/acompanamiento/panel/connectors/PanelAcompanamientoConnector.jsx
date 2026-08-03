/**
 * Conector: panel de acompañamiento (ACA) — provider + página.
 *
 * `embedded`: pestaña «Panel» del contenedor Seguimiento académico
 * (ACA-SEGUIMIENTO) — mismo provider, contenido sin shell de página.
 */

import { PanelAcompanamientoProvider } from '@application-academico/acompanamiento/panel/providers/PanelAcompanamientoProvider';
import PanelAcompanamientoPage from '@academico/acompanamiento/panel/pages/PanelAcompanamientoPage';

const PanelAcompanamientoConnector = ({ embedded = false }) => (
  <PanelAcompanamientoProvider>
    <PanelAcompanamientoPage embedded={embedded} />
  </PanelAcompanamientoProvider>
);

export default PanelAcompanamientoConnector;
