// modules/inscripciones/connectors/InscripcionesNuevaConnector.jsx
/**
 * Conector: Nexo entre la Vista (Page) y la Lógica de Negocio (Provider)
 * 
 * Single Responsibility: Solo envuelve la página de inscripción nueva con su Provider específico
 * 
 * Este patrón permite:
 * - Separación clara: Conectores vs Páginas
 * - Carga lazy del Provider solo cuando se necesita
 * - Arquitectura modular: cada módulo gestiona sus propios conectores
 * 
 * Estructura de providers:
 * - InscripcionesProvider: Provider global del módulo (estado compartido)
 * - InscripcionesNuevaProvider: Provider específico para la feature de inscripción nueva
 */

import { InscripcionesProvider, InscripcionesNuevaProvider } from '@application-inscripciones/providers';
import InscripcionesNueva from '@inscripciones/pages/InscripcionesNueva';

const InscripcionesNuevaConnector = () => {
  return (
    <InscripcionesProvider>
      <InscripcionesNuevaProvider>
        <InscripcionesNueva />
      </InscripcionesNuevaProvider>
    </InscripcionesProvider>
  );
};

export default InscripcionesNuevaConnector;
