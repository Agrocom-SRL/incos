/**
 * Conector: registrar ficha de seguimiento (DOC) — provider + página en modo
 * create. Ruta DOC-SUPERVISION-REGISTRAR (/docentes/supervision/registrar).
 */

import { FichaSeguimientoFormProvider } from '@application-docentes/supervision/providers/FichaSeguimientoFormProvider';
import FichaSeguimientoFormPage from '@docentes/supervision/pages/FichaSeguimientoFormPage';

const FichaSeguimientoFormCreateConnector = () => (
  <FichaSeguimientoFormProvider>
    <FichaSeguimientoFormPage mode="create" />
  </FichaSeguimientoFormProvider>
);

export default FichaSeguimientoFormCreateConnector;
