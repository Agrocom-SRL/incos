import { SeguridadUsuarioPermisosPageContext } from '@/application/modules/seguridad/context/SeguridadUsuarioPermisosPageContext';
import { useSeguridadUsuarioPermisosPage } from '@/application/modules/seguridad/hooks/state/useSeguridadUsuarioPermisosPage';

export const SeguridadUsuarioPermisosProvider = ({ children }) => {
  const value = useSeguridadUsuarioPermisosPage();
  return (
    <SeguridadUsuarioPermisosPageContext.Provider value={value}>
      {children}
    </SeguridadUsuarioPermisosPageContext.Provider>
  );
};
