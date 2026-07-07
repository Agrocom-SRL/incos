/**
 * Conector del menú Académico: providers compartidos + página con tabs.
 */

import { CarreraProvider, MateriaProvider } from '@application-configuracion/academico/providers';
import AcademicoPage from '@configuracion/academico/pages/AcademicoPage';

const AcademicoConnector = () => (
  <CarreraProvider>
    <MateriaProvider>
      <AcademicoPage />
    </MateriaProvider>
  </CarreraProvider>
);

export default AcademicoConnector;
