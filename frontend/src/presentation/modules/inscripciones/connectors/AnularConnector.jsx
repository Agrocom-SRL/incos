/**
 * Conector: Nexo entre la Vista (Page) y la Lógica de Negocio (Provider)
 * 
 * Single Responsibility: Solo envuelve la página con su Provider específico
 * 
 * Este patrón permite:
 * - Separación clara: Conectores vs Páginas
 * - Carga lazy del Provider solo cuando se necesita
 * - Arquitectura modular: cada módulo gestiona sus propios conectores
 */

import { InscripcionesProvider, InscripcionesListProvider } from '@application-inscripciones/providers';
import InscripcionesAnular from '@inscripciones/pages/InscripcionesAnular';

const AnularConnector = () => {
  return (
    <InscripcionesProvider>
      <InscripcionesListProvider>
        <InscripcionesAnular />
      </InscripcionesListProvider>
    </InscripcionesProvider>
  );
};

export default AnularConnector;
