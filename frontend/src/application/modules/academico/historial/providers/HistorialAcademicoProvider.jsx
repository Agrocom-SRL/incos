/**
 * Provider (delgado) del Historial académico (detalle).
 *
 * Resuelve el `:id` de la ruta, ensambla el hook de pantalla
 * `useHistorialAcademico` y publica su contrato por contexto. No contiene lógica
 * de negocio (solo compone), según incos-frontend-module.
 */

import { useParams } from 'react-router-dom';
import { HistorialAcademicoContext } from '@application-academico/historial/context/HistorialAcademicoContext.js';
import { useHistorialAcademico } from '@application-academico/historial/hooks/state/useHistorialAcademico.js';

export const HistorialAcademicoProvider = ({ children }) => {
  const { id } = useParams();
  const value = useHistorialAcademico(id != null ? Number(id) : null);

  return (
    <HistorialAcademicoContext.Provider value={value}>
      {children}
    </HistorialAcademicoContext.Provider>
  );
};

export default HistorialAcademicoProvider;
