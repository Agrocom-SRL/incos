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

import { InscripcionesListProvider } from '@application-inscripciones/providers';
import InscripcionesList from '@inscripciones/pages/InscripcionesList';

const ListConnector = () => {
  return (
    <InscripcionesListProvider>
      <InscripcionesList />
    </InscripcionesListProvider>
  );
};

export default ListConnector;
