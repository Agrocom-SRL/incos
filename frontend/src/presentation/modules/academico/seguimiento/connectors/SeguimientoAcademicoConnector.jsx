/**
 * Conector: página de Seguimiento académico (ACA-SEGUIMIENTO, tabs por permiso).
 *
 * Sin providers propios: Avance/Deserción usan hooks de pantalla y cada pestaña
 * de acompañamiento monta su provider dentro del contenido embebido (el fetch
 * ocurre recién al activar la pestaña).
 *
 * `defaultTab` permite que las rutas gemelas legadas (/academico/avance,
 * /academico/acompanamiento/*) abran el contenedor en su pestaña original
 * cuando la URL no trae `?tab=`.
 */

import SeguimientoAcademicoPage from '../pages/SeguimientoAcademicoPage.jsx';
import { TAB_AVANCE } from '../config/seguimientoTabs.js';

const SeguimientoAcademicoConnector = ({ defaultTab = TAB_AVANCE }) => (
  <SeguimientoAcademicoPage defaultTab={defaultTab} />
);

export default SeguimientoAcademicoConnector;
