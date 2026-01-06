// modules/estudiantes/connectors/DetailConnector.jsx
/**
 * Conector: Nexo entre la Vista (Page) y la Lógica de Negocio (Provider)
 * 
 * Single Responsibility: Solo envuelve la página de detalle con su Provider específico
 * 
 * Este patrón permite:
 * - Separación clara: Conectores vs Páginas
 * - Carga lazy del Provider solo cuando se necesita
 * - Arquitectura modular: cada módulo gestiona sus propios conectores
 * - Obtiene el studentId del parámetro de ruta :id y lo pasa al Provider
 */

import { useParams } from 'react-router-dom';
import { StudentProvider, StudentDetailProvider } from '@application-estudiantes/providers';
import EstudiantesDetail from '@estudiantes/pages/EstudiantesDetail';

const DetailConnector = () => {
  const { id } = useParams();
  const studentId = id;

  return (
    <StudentProvider>
      <StudentDetailProvider studentId={studentId}>
        <EstudiantesDetail />
      </StudentDetailProvider>
    </StudentProvider>
  );
};

export default DetailConnector;

