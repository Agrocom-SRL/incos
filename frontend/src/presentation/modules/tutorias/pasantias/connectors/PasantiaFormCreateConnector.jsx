/**
 * Conector: registro de trámite de pasantía (TUT) — provider + página en
 * modo create. Punto de entrada lazy de la ruta /tutorias/pasantias/registrar.
 */

import { PasantiaFormProvider } from '@application-tutorias/pasantias/providers/PasantiaFormProvider';
import PasantiaFormPage from '@tutorias/pasantias/pages/PasantiaFormPage';

const PasantiaFormCreateConnector = () => (
  <PasantiaFormProvider>
    <PasantiaFormPage mode="create" />
  </PasantiaFormProvider>
);

export default PasantiaFormCreateConnector;
