import { useDiscapacidadesList } from '../hooks/features/useDiscapacidadesList';
import { DiscapacidadContext } from '../context/DiscapacidadContext';

export const DiscapacidadProvider = ({ children }) => {
  const listData = useDiscapacidadesList();
  return (
    <DiscapacidadContext.Provider value={listData}>{children}</DiscapacidadContext.Provider>
  );
};
