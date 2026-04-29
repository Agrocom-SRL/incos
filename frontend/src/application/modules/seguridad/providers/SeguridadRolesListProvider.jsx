import { SeguridadRolesListPageContext } from '@/application/modules/seguridad/context/SeguridadRolesListPageContext';
import { useSeguridadRolesListPage } from '@/application/modules/seguridad/hooks/state/useSeguridadRolesListPage.jsx';

export const SeguridadRolesListProvider = ({ children }) => {
  const value = useSeguridadRolesListPage();
  return (
    <SeguridadRolesListPageContext.Provider value={value}>
      {children}
    </SeguridadRolesListPageContext.Provider>
  );
};
