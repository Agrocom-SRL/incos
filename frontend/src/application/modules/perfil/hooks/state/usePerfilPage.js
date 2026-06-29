import { useCallback, useMemo, useState } from 'react';
import { App } from 'antd';
import { useAuth } from '@/application/modules/auth/hooks/useAuth.js';
import perfilRepository from '@/infrastructure/repositories/auth/PerfilRepository.js';

function errMsg(json) {
  const e = json?.error;
  if (json?.error?.details?.length) {
    return json.error.details.map((d) => d.message).join('. ');
  }
  return typeof e === 'string' ? e : e?.message || 'No se pudo actualizar la contraseña';
}

export const usePerfilPage = () => {
  const { usuario, isLoading, refreshMe } = useAuth();
  const { message } = App.useApp();

  const [openPass, setOpenPass] = useState(false);
  const [saving, setSaving] = useState(false);

  const cambiarPassword = useCallback(
    async ({ password_actual, password_nuevo }) => {
      setSaving(true);
      try {
        await perfilRepository.cambiarMiPassword({ password_actual, password_nuevo });
        setOpenPass(false);
        message.success('Contraseña actualizada correctamente');
        return true;
      } catch (error) {
        message.error(errMsg(error));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [message]
  );

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Mi perfil' }],
    []
  );

  return {
    usuario,
    loading: isLoading,
    vinculoPerfil: usuario?.vinculo_perfil ?? null,
    openPass,
    saving,
    breadcrumbItems,
    setOpenPass,
    cambiarPassword,
    refreshMe,
  };
};
