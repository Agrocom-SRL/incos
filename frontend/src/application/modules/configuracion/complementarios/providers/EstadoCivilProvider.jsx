import { useEstadosCivilesList } from '../hooks/features/useEstadosCivilesList';
import { EstadoCivilContext } from '../context/EstadoCivilContext';

export const EstadoCivilProvider = ({ children }) => {
  const listData = useEstadosCivilesList();
  return <EstadoCivilContext.Provider value={listData}>{children}</EstadoCivilContext.Provider>;
};
