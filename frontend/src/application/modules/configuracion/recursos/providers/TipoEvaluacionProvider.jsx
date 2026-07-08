import { useTiposEvaluacionList } from '../hooks/features/useTiposEvaluacionList';
import { TipoEvaluacionContext } from '../context/TipoEvaluacionContext';

export const TipoEvaluacionProvider = ({ children }) => {
  const listData = useTiposEvaluacionList();
  return <TipoEvaluacionContext.Provider value={listData}>{children}</TipoEvaluacionContext.Provider>;
};
