/**
 * Provider: detalle de un docente (ficha).
 */

import { useDocenteDetail } from '@application-docentes/hooks';
import { DocentesDetailContext } from '@application-docentes/context/DocentesDetailContext';

export const DocentesDetailProvider = ({ children, docenteId }) => {
  const value = useDocenteDetail(docenteId);
  return <DocentesDetailContext.Provider value={value}>{children}</DocentesDetailContext.Provider>;
};
