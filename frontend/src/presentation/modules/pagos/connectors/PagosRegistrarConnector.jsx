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
 * - Obtiene el studentId del estado de navegación y lo pasa al Provider si es necesario
 * 
 * Estructura de providers:
 * - StudentProvider: Provider global del módulo de estudiantes (estado compartido)
 * - StudentDetailProvider: Provider específico para obtener detalles del estudiante
 * - PagosProvider: Provider global del módulo de pagos (estado compartido)
 * - PagosRegistrarProvider: Provider específico para la feature de registro de pago
 */

import { useLocation } from 'react-router-dom';
import { StudentProvider, StudentDetailProvider } from '@application-estudiantes/providers';
import { PagosProvider, PagosRegistrarProvider } from '../../../../application/modules/pagos/providers';
import PagosRegistrar from '../pages/PagosRegistrar';

const PagosRegistrarConnector = () => {
  const location = useLocation();
  const studentId = location.state?.studentId || null;

  // Siempre proporcionar todos los providers necesarios
  // Si no hay studentId, los providers manejarán el caso sin cargar datos
  // pero los hooks siempre estarán disponibles
  return (
    <StudentProvider>
      <StudentDetailProvider studentId={studentId}>
        <PagosProvider>
          <PagosRegistrarProvider>
            <PagosRegistrar />
          </PagosRegistrarProvider>
        </PagosProvider>
      </StudentDetailProvider>
    </StudentProvider>
  );
};

export default PagosRegistrarConnector;
