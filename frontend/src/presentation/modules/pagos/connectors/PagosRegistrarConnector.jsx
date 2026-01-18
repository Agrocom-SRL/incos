// modules/pagos/connectors/PagosRegistrarConnector.jsx
/**
 * Conector: Nexo entre la Vista (Page) y la Lógica de Negocio (Provider)
 * 
 * Single Responsibility: Solo envuelve la página de registro de pago con su Provider específico
 * 
 * Este patrón permite:
 * - Separación clara: Conectores vs Páginas
 * - Carga lazy del Provider solo cuando se necesita
 * - Arquitectura modular: cada módulo gestiona sus propios conectores
 * 
 * Estructura de providers:
 * - PagosProvider: Provider global del módulo (estado compartido)
 * - PagosRegistrarProvider: Provider específico para la feature de registro de pago
 */

import { PagosProvider, PagosRegistrarProvider } from '../../../../application/modules/pagos/providers';
import PagosRegistrar from '../pages/PagosRegistrar';

const PagosRegistrarConnector = () => {
  return (
    <PagosProvider>
      <PagosRegistrarProvider>
        <PagosRegistrar />
      </PagosRegistrarProvider>
    </PagosProvider>
  );
};

export default PagosRegistrarConnector;
