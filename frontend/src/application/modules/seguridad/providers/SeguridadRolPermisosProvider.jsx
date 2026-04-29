import { SeguridadRolPermisosPageContext } from '@/application/modules/seguridad/context/SeguridadRolPermisosPageContext';
import { useSeguridadRolPermisosPage } from '@/application/modules/seguridad/hooks/state/useSeguridadRolPermisosPage';

export const SeguridadRolPermisosProvider = ({ children }) => {
  const value = useSeguridadRolPermisosPage();
  return (
    <SeguridadRolPermisosPageContext.Provider value={value}>
      {children}
    </SeguridadRolPermisosPageContext.Provider>
  );
};
