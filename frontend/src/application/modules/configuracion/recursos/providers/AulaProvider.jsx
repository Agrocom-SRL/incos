import { useAulasList } from '../hooks/features/useAulasList';
import { AulaContext } from '../context/AulaContext';

export const AulaProvider = ({ children }) => {
  const listData = useAulasList();
  return <AulaContext.Provider value={listData}>{children}</AulaContext.Provider>;
};
