import { useIdiomasList } from '../hooks/features/useIdiomasList';
import { IdiomaContext } from '../context/IdiomaContext';

export const IdiomaProvider = ({ children }) => {
  const listData = useIdiomasList();
  return <IdiomaContext.Provider value={listData}>{children}</IdiomaContext.Provider>;
};
