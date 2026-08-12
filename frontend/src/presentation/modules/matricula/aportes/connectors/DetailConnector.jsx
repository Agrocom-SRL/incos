// modules/matricula/aportes/connectors/DetailConnector.jsx
/**
 * Conector: Nexo entre la Vista (Page) y la Lógica de Negocio (Provider)
 * 
 * Single Responsibility: Solo envuelve la página de detalle con su Provider específico
 * 
 * Este patrón permite:
 * - Separación clara: Conectores vs Páginas
 * - Carga lazy del Provider solo cuando se necesita
 * - Arquitectura modular: cada módulo gestiona sus propios conectores
 * - Obtiene el pagoId del parámetro de ruta :id y lo pasa al Provider
 */

import { useParams } from 'react-router-dom';
import { PagosProvider, PagosDetailProvider } from '@application-pagos/providers';
import PagosDetail from '@pagos/pages/PagosDetail';

const DetailConnector = () => {
  const { id } = useParams();
  const pagoId = id ? parseInt(id, 10) : null;

  return (
    <PagosProvider>
      <PagosDetailProvider pagoId={pagoId}>
        <PagosDetail />
      </PagosDetailProvider>
    </PagosProvider>
  );
};

export default DetailConnector;
