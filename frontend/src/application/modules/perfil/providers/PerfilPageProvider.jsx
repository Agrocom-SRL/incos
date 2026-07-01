import { PerfilPageContext } from '@/application/modules/perfil/context/PerfilPageContext';
import { usePerfilPage } from '@/application/modules/perfil/hooks/state/usePerfilPage';

export const PerfilPageProvider = ({ children }) => {
  const value = usePerfilPage();
  return (
    <PerfilPageContext.Provider value={value}>
      {children}
    </PerfilPageContext.Provider>
  );
};
