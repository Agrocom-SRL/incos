import { useMateriasList } from '../hooks/features/useMateriasList';
import { MateriaContext } from '../context/MateriaContext';

export const MateriaProvider = ({ children }) => {
  const listData = useMateriasList();
  return <MateriaContext.Provider value={listData}>{children}</MateriaContext.Provider>;
};
