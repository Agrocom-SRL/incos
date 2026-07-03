import { useCallback, useMemo, useState } from 'react';
import { App } from 'antd';
import { useAuth } from '@/application/modules/auth/hooks/useAuth.js';
import { esEstudiante } from '@/application/modules/auth/utils/esEstudiante.js';
import { esDocente } from '@/application/modules/auth/utils/esDocente.js';
import perfilRepository from '@/infrastructure/repositories/auth/PerfilRepository.js';
import { usePerfilEstudianteResumen } from './usePerfilEstudianteResumen.js';
import { usePerfilDocenteResumen } from './usePerfilDocenteResumen.js';

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

  // Portal del estudiante: resumen para el hub (solo si el rol es ESTUDIANTE).
  const usuarioEsEstudiante = esEstudiante(usuario);
  const resumenEstudiante = usePerfilEstudianteResumen(usuarioEsEstudiante);

  // Portal del docente: métricas ligeras para el hub (solo si el rol es DOCENTE).
  const usuarioEsDocente = esDocente(usuario);
  const resumenDocente = usePerfilDocenteResumen(usuarioEsDocente);

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

  // Datos derivados de la cuenta (mapeo, no presentación): rol, tipo y nombre a mostrar.
  const rol = usuario?.rol ?? null;
  const tipoRol = !rol ? '—' : rol.is_system ? 'Sistema' : 'Personalizado';
  const nombreMostrado = usuario?.vinculo_perfil?.nombre_completo || usuario?.username;
  const correo = usuario?.email || 'Sin correo';

  return {
    usuario,
    loading: isLoading,
    vinculoPerfil: usuario?.vinculo_perfil ?? null,
    esEstudiante: usuarioEsEstudiante,
    esDocente: usuarioEsDocente,
    resumenEstudiante,
    resumenDocente,
    rol,
    tipoRol,
    nombreMostrado,
    correo,
    openPass,
    saving,
    breadcrumbItems,
    setOpenPass,
    cambiarPassword,
    refreshMe,
  };
};
