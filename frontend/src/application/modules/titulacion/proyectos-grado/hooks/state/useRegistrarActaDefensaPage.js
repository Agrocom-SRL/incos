/**
 * Hook de pantalla: registrar el acta de defensa de grado (TIT · extensión
 * 2026-08-11, proyecto·APROBAR). Antes vivía en `RegistrarActaDefensaModal`;
 * la lógica de formulario es la misma (fecha/hora, tribunal de 3 docentes,
 * calificación individual por integrante ACTIVO — P3), envuelta ahora como
 * página con navegación propia.
 *
 * "Volver" (mismo criterio que `useProyectoGradoFormPage`, pedido explícito
 * del usuario): NO regresa a la ficha del proyecto, salta directo a
 * `returnListPath` (la lista de la que se entró a la ficha). Al REGISTRAR con
 * éxito sí navega a la ficha, en la tab "Acta de defensa", para ver el
 * resultado aplicado.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Form } from 'antd';
import { useRegistrarActaDefensaContext } from '@application-titulacion/proyectos-grado/hooks/context/useRegistrarActaDefensaContext';
import {
  PROYECTOS_GRADO_LIST_PATH,
  TIT_PROYECTOS_MENU_KEY,
  proyectoGradoDetallePath,
} from '@application-titulacion/config/paths';

/** Miembros del Tribunal Evaluador por acta (espejo de `TRIBUNAL_ACTA_DEFENSA_MIEMBROS`, backend). */
export const TRIBUNAL_MIEMBROS = 3;
export const CARGO_DEFECTO = 'Tribunal Evaluador';
const HORA_FORMATO = 'HH:mm';

export const useRegistrarActaDefensaPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const { proyectoId, proyecto, loading, error, docentesCatalogo, registrarActaDefensa } =
    useRegistrarActaDefensaContext();

  const [submitError, setSubmitError] = useState(null);

  const returnListPath = location.state?.returnListPath || PROYECTOS_GRADO_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? TIT_PROYECTOS_MENU_KEY;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Titulación' },
      { title: 'Proyectos de grado', href: returnListPath },
      { title: 'Registrar acta de defensa' },
    ],
    [returnListPath]
  );

  /** Solo integrantes ACTIVOS defienden (P3: una calificación individual por estudiante). */
  const integrantesActivos = useMemo(
    () => (proyecto?.integrantes ?? []).filter((i) => i.estado === 'ACTIVO'),
    [proyecto?.integrantes]
  );

  useEffect(() => {
    form.setFieldsValue({
      tribunal: Array.from({ length: TRIBUNAL_MIEMBROS }, () => ({ cargo: CARGO_DEFECTO })),
    });
  }, [form]);

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleSubmit = useCallback(async () => {
    setSubmitError(null);
    try {
      const values = await form.validateFields();
      const payload = {
        fechaDefensa: values.fechaDefensa.format('YYYY-MM-DD'),
        horaInicio: values.horaInicio.format(HORA_FORMATO),
        horaConclusion: values.horaConclusion
          ? values.horaConclusion.format(HORA_FORMATO)
          : undefined,
        tribunal: (values.tribunal || []).map((miembro) => ({
          docenteId: miembro.docenteId,
          cargo: (miembro.cargo || '').trim() || undefined,
        })),
        calificaciones: integrantesActivos.map((integrante) => ({
          estudianteId: integrante.estudianteId,
          calificacionFinal: values.calificaciones?.[integrante.estudianteId],
        })),
        numeroActa: values.numeroActa || undefined,
      };

      const resultado = await registrarActaDefensa.registrar(proyectoId, payload);
      if (!resultado?.success) {
        throw new Error(resultado?.error || 'No se pudo registrar el acta de defensa');
      }

      notification.success({
        title: 'Acta de defensa registrada',
        description:
          'Se registró el acta de defensa y el proyecto quedó actualizado con el resultado del tribunal.',
      });
      navigate(proyectoGradoDetallePath(proyectoId), {
        state: { returnListPath, menuSidebarKey, activeTab: 'acta-defensa' },
      });
    } catch (e) {
      if (e?.errorFields) {
        setSubmitError('Revise los campos obligatorios');
      } else {
        const msg = e?.message || 'No se pudo registrar el acta de defensa';
        setSubmitError(msg);
        notification.error({ title: 'No se pudo registrar el acta de defensa', description: msg });
      }
    }
  }, [
    form,
    integrantesActivos,
    registrarActaDefensa,
    proyectoId,
    notification,
    navigate,
    returnListPath,
    menuSidebarKey,
  ]);

  return {
    form,
    proyecto,
    loading,
    error,
    breadcrumbItems,
    integrantesActivos,
    docentes: docentesCatalogo.docentes,
    loadingDocentes: docentesCatalogo.loading,
    docentesDisponible: docentesCatalogo.disponible,
    saving: registrarActaDefensa.saving,
    submitError,
    handleVolver,
    handleSubmit,
  };
};

export default useRegistrarActaDefensaPage;
