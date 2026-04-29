import { SeguridadUsuarioCreatePageContext } from '@/application/modules/seguridad/context/SeguridadUsuarioCreatePageContext';
import { useSeguridadUsuarioCreatePage } from '@/application/modules/seguridad/hooks/state/useSeguridadUsuarioCreatePage';

export const SeguridadUsuarioCreateProvider = ({ children }) => {
  const value = useSeguridadUsuarioCreatePage();
  return (
    <SeguridadUsuarioCreatePageContext.Provider value={value}>
      {children}
    </SeguridadUsuarioCreatePageContext.Provider>
  );
};
