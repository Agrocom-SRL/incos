/**
 * Conector del menú Académico: providers compartidos + página con tabs.
 */

import {
  CarreraProvider,
  MateriaProvider,
  ParaleloProvider,
} from '@application-configuracion/academico/providers';
import AcademicoPage from '@configuracion/academico/pages/AcademicoPage';

const AcademicoConnector = () => (
  <CarreraProvider>
    <MateriaProvider>
      <ParaleloProvider>
        <AcademicoPage />
      </ParaleloProvider>
    </MateriaProvider>
  </CarreraProvider>
);

export default AcademicoConnector;
