import { SeguridadRolDetailPageContext } from '@/application/modules/seguridad/context/SeguridadRolDetailPageContext';
import { useSeguridadRolDetailPage } from '@/application/modules/seguridad/hooks/state/useSeguridadRolDetailPage';

export const SeguridadRolDetailProvider = ({ children }) => {
  const value = useSeguridadRolDetailPage();
  return (
    <SeguridadRolDetailPageContext.Provider value={value}>
      {children}
    </SeguridadRolDetailPageContext.Provider>
  );
};
