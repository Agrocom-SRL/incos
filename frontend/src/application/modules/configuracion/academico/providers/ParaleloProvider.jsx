import { useParalelosList } from '../hooks/features/useParalelosList';
import { ParaleloContext } from '../context/ParaleloContext';

export const ParaleloProvider = ({ children }) => {
  const listData = useParalelosList();
  return <ParaleloContext.Provider value={listData}>{children}</ParaleloContext.Provider>;
};
