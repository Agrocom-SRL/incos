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

import { PagosProvider, PagosListProvider } from '@application-pagos/providers';
import PagosList from '@pagos/pages/PagosList';

const ListConnector = () => {
  return (
    <PagosProvider>
      <PagosListProvider>
        <PagosList />
      </PagosListProvider>
    </PagosProvider>
  );
};

export default ListConnector;
