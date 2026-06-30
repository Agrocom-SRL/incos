/**
 * Conector "Mis aportes" — portal del estudiante. La página consume su propio
 * hook de estado (sin Provider), así que el conector solo la monta.
 */

import MisAportesPage from '@pagos/pages/MisAportesPage.jsx';

const MisAportesConnector = () => <MisAportesPage />;

export default MisAportesConnector;
