/**
 * Conector: registro de trámite de pasantía (TIT) — provider + página en
 * modo create. Punto de entrada lazy de la ruta /titulacion/pasantias/registrar.
 */

import { PasantiaFormProvider } from '@application-titulacion/pasantias/providers/PasantiaFormProvider';
import PasantiaFormPage from '@titulacion/pasantias/pages/PasantiaFormPage';

const PasantiaFormCreateConnector = () => (
  <PasantiaFormProvider>
    <PasantiaFormPage mode="create" />
  </PasantiaFormProvider>
);

export default PasantiaFormCreateConnector;
