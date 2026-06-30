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

import { PagosListProvider } from '@application-pagos/providers';
import { useAuth, esEstudiante } from '@application-auth';
import PagosList from '@pagos/pages/PagosList';
import MisAportesConnector from './MisAportesConnector.jsx';

/**
 * Role-aware (patrón docente CoordinacionPage→MisCursosPage):
 * - ESTUDIANTE → "Mis aportes" (SOLO LECTURA, sus propios aportes).
 * - Staff → listado administrativo de pagos/aportes (sin cambios).
 */
const ListConnector = () => {
  const { usuario } = useAuth();

  if (esEstudiante(usuario)) {
    return <MisAportesConnector />;
  }

  return (
    <PagosListProvider>
      <PagosList />
    </PagosListProvider>
  );
};

export default ListConnector;
