import { useApoderadosList } from '../hooks/features/useApoderadosList';
import { ApoderadoContext } from '../context/ApoderadoContext';

export const ApoderadoProvider = ({ children }) => {
  const listData = useApoderadosList();
  return <ApoderadoContext.Provider value={listData}>{children}</ApoderadoContext.Provider>;
};
