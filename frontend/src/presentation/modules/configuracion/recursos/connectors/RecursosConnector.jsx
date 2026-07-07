/**
 * Conector del menú Recursos académicos: providers compartidos + página con tabs.
 */

import { ParaleloProvider } from '@application-configuracion/recursos/providers';
import RecursosPage from '@configuracion/recursos/pages/RecursosPage';

const RecursosConnector = () => (
  <ParaleloProvider>
    <RecursosPage />
  </ParaleloProvider>
);

export default RecursosConnector;
