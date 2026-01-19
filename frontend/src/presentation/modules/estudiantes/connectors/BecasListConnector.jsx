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

import { BecasProvider, BecasListProvider } from '@application-estudiantes/providers';
import BecasList from '@estudiantes/pages/BecasList';

const BecasListConnector = () => {
  return (
    <BecasProvider>
      <BecasListProvider>
        <BecasList />
      </BecasListProvider>
    </BecasProvider>
  );
};

export default BecasListConnector;
