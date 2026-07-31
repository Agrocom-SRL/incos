/**
 * Conector: alta de empresa del catálogo de pasantías (TIT) — provider +
 * página en modo create. Punto de entrada lazy de la ruta
 * /titulacion/pasantias/empresas/registrar.
 */

import { PasantiaEmpresaFormProvider } from '@application-titulacion/pasantias/providers/PasantiaEmpresaFormProvider';
import PasantiaEmpresaFormPage from '@titulacion/pasantias/pages/PasantiaEmpresaFormPage';

const PasantiaEmpresaFormCreateConnector = () => (
  <PasantiaEmpresaFormProvider>
    <PasantiaEmpresaFormPage mode="create" />
  </PasantiaEmpresaFormProvider>
);

export default PasantiaEmpresaFormCreateConnector;
