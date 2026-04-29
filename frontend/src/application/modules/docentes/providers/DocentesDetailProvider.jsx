/**
 * Provider: detalle de un docente (ficha).
 */

import { useDocentesDetailPage } from '@application-docentes/hooks';
import { DocentesDetailContext } from '@application-docentes/context/DocentesDetailContext';

export const DocentesDetailProvider = ({ children, docenteId }) => {
  const value = useDocentesDetailPage(docenteId);
  return <DocentesDetailContext.Provider value={value}>{children}</DocentesDetailContext.Provider>;
};
