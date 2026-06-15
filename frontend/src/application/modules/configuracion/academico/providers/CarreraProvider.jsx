import { useCarrerasList } from '../hooks/features/useCarrerasList';
import { CarreraContext } from '../context/CarreraContext';

export const CarreraProvider = ({ children }) => {
  const listData = useCarrerasList();
  return <CarreraContext.Provider value={listData}>{children}</CarreraContext.Provider>;
};
