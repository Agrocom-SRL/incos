import { useActividadesList } from '../hooks/features/useActividadesList';
import { ActividadContext } from '../context/ActividadContext';

export const ActividadProvider = ({ children }) => {
  const listData = useActividadesList();
  return <ActividadContext.Provider value={listData}>{children}</ActividadContext.Provider>;
};
