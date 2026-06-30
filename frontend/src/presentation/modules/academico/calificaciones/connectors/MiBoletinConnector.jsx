/**
 * Conector "Mi boletín" — portal del estudiante. La página consume su propio
 * hook de estado, así que el conector solo la monta.
 */

import MiBoletinPage from '../pages/MiBoletinPage.jsx';

const MiBoletinConnector = () => <MiBoletinPage />;

export default MiBoletinConnector;
