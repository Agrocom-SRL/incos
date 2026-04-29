import { SeguridadUsuariosListPageContext } from '@/application/modules/seguridad/context/SeguridadUsuariosListPageContext';
import { useSeguridadUsuariosListPage } from '@/application/modules/seguridad/hooks/state/useSeguridadUsuariosListPage';

export const SeguridadUsuariosListProvider = ({ children }) => {
  const value = useSeguridadUsuariosListPage();
  return (
    <SeguridadUsuariosListPageContext.Provider value={value}>
      {children}
    </SeguridadUsuariosListPageContext.Provider>
  );
};
