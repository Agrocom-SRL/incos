/**
 * Conector del menú Recursos académicos: providers compartidos + página con tabs.
 */

import { ParaleloProvider, AulaProvider, TipoEvaluacionProvider } from '@application-configuracion/recursos/providers';
import RecursosPage from '@configuracion/recursos/pages/RecursosPage';

const RecursosConnector = () => (
  <ParaleloProvider>
    <AulaProvider>
      <TipoEvaluacionProvider>
        <RecursosPage />
      </TipoEvaluacionProvider>
    </AulaProvider>
  </ParaleloProvider>
);

export default RecursosConnector;
