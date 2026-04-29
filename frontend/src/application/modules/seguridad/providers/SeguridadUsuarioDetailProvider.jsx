import { SeguridadUsuarioDetailPageContext } from '@/application/modules/seguridad/context/SeguridadUsuarioDetailPageContext';
import { useSeguridadUsuarioDetailPage } from '@/application/modules/seguridad/hooks/state/useSeguridadUsuarioDetailPage';

export const SeguridadUsuarioDetailProvider = ({ children }) => {
  const value = useSeguridadUsuarioDetailPage();
  return (
    <SeguridadUsuarioDetailPageContext.Provider value={value}>
      {children}
    </SeguridadUsuarioDetailPageContext.Provider>
  );
};
