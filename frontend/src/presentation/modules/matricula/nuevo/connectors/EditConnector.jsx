// modules/matricula/nuevo/connectors/EditConnector.jsx
/**
 * Conector: Nexo entre la Vista (Page) y la Lógica de Negocio (Provider)
 *
 * Single Responsibility: Solo envuelve la página de edición con sus Providers específicos
 *
 * Este patrón permite:
 * - Separación clara: Conectores vs Páginas
 * - Carga lazy del Provider solo cuando se necesita
 * - Arquitectura modular: cada módulo gestiona sus propios conectores
 * - Obtiene el studentId del parámetro de ruta :id y carga los datos para edición
 *
 * `StudentProvider`/`StudentDetailProvider` son compartidos entre 3-4 dominios y se
 * quedaron en `matricula/admision/` (Proceso de admisión); este conector cruza hacia
 * allí para consumirlos, igual patrón que `matricula/registro/` con el buscador.
 */

import { useParams } from 'react-router-dom';
import { StudentProvider, StudentDetailProvider } from '@application-matricula/admision/providers';
import { StudentRegisterProvider } from '@application-matricula/nuevo/providers/StudentRegisterProvider';
import EstudiantesRegister from '@matricula/nuevo/pages/EstudiantesRegister';

const EditConnector = () => {
  const { id } = useParams();
  const studentId = id;

  return (
    <StudentProvider>
      <StudentDetailProvider studentId={studentId}>
        <StudentRegisterProvider mode="edit" studentId={studentId}>
          <EstudiantesRegister mode="edit" studentId={studentId} />
        </StudentRegisterProvider>
      </StudentDetailProvider>
    </StudentProvider>
  );
};

export default EditConnector;

