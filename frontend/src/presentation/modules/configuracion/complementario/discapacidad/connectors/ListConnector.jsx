// modules/configuracion/complementario/discapacidad/connectors/ListConnector.jsx
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

import { DiscapacidadProvider } from '@application/modules/configuracion/complementario/discapacidad/providers';
import DiscapacidadesList from '../pages/DiscapacidadesList';

const ListConnector = () => {
  return (
    <DiscapacidadProvider>
      <DiscapacidadesList />
    </DiscapacidadProvider>
  );
};

export default ListConnector;

