/**
 * Provider: estado compartido de docentes (lista cargada desde API).
 */

import { useDocentesApi } from '@application-docentes/hooks/api/useDocentesApi';
import { DocentesContext } from '@application-docentes/context/DocentesContext';

export const DocentesProvider = ({ children }) => {
  const value = useDocentesApi();
  return <DocentesContext.Provider value={value}>{children}</DocentesContext.Provider>;
};
