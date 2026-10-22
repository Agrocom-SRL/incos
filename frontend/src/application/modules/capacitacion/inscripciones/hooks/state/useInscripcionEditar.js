/**
 * Hook de pantalla: «Editar inscripción» de la ficha (CAP · capacitacion.inscripcion
 * EDITAR, `PUT /:id`). Modal con dos bloques: datos del participante (se reflejan
 * en sus otras inscripciones) y grupo del curso (solo con la inscripción
 * PENDIENTE/INSCRITO y el curso con al menos un grupo).
 *
 * Solo envía lo que cambió (`buildInscripcionUpdatePayload`); sin cambios no llama
 * al backend. Un error del servidor (p. ej. 409: CI duplicado o grupo lleno)
 * queda visible dentro del modal para corregir sin perder lo escrito. En éxito
 * el provider ya refrescó la ficha.
 *
 * `location.state.abrirEditar` (acción «Editar» del listado) abre el modal al
 * cargar la ficha, una sola vez.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { App, Form } from 'antd';
import { useLocation } from 'react-router-dom';
import { useInscripcionCapacitacionDetailContext } from '@application-capacitacion/inscripciones/hooks/context/useInscripcionCapacitacionDetailContext';
import {
  buildInscripcionUpdatePayload,
  mapInscripcionToEditFormValues,
} from '@application-capacitacion/inscripciones/mappers/inscripcionEdicionMapper';
import {
  motivoGrupoNoEditable,
  opcionesGrupoEdicion,
} from '@application-capacitacion/utils/inscripcionGrupos';

export const useInscripcionEditar = () => {
  const { message } = App.useApp();
  const location = useLocation();
  const [form] = Form.useForm();

  const {
    inscripcion,
    actualizarInscripcion,
    actualizandoInscripcion,
    cursoDetalle,
    loadingCursoDetalle,
    errorCursoDetalle,
    cargarCursoDetalle,
  } = useInscripcionCapacitacionDetailContext();

  const [abiertoManual, setAbiertoManual] = useState(false);
  const [autoDescartado, setAutoDescartado] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState(null);
  const cursoSolicitadoRef = useRef(null);

  // Acción «Editar» del listado: se abre sola al cargar la ficha, hasta que se cierre.
  const abrirAlCargar = Boolean(location.state?.abrirEditar) && Boolean(inscripcion) && !autoDescartado;
  const open = abiertoManual || abrirAlCargar;

  // Grupos del curso de ESTA inscripción (evita mostrar los de otro curso cargado antes).
  const grupos = useMemo(
    () => (cursoDetalle?.id === inscripcion?.capacitacionId ? (cursoDetalle?.grupos ?? []) : []),
    [cursoDetalle, inscripcion?.capacitacionId],
  );
  const grupoMotivoDeshabilitado = useMemo(
    () => (inscripcion ? motivoGrupoNoEditable(inscripcion, grupos) : null),
    [inscripcion, grupos],
  );
  const grupoOptions = useMemo(
    () => opcionesGrupoEdicion(grupos, inscripcion?.capacitacionGrupoId ?? null),
    [grupos, inscripcion?.capacitacionGrupoId],
  );
  const initialValues = useMemo(() => mapInscripcionToEditFormValues(inscripcion), [inscripcion]);

  const abrir = useCallback(() => {
    if (!inscripcion) return;
    setErrorGuardar(null);
    setAbiertoManual(true);
  }, [inscripcion]);

  const cerrar = useCallback(() => {
    setAbiertoManual(false);
    setAutoDescartado(true);
    setErrorGuardar(null);
    cursoSolicitadoRef.current = null; // la próxima apertura refresca los cupos
  }, []);

  // Al abrir, carga los grupos del curso de la inscripción (una vez por curso).
  const cursoId = inscripcion?.capacitacionId ?? null;
  useEffect(() => {
    if (!open || cursoId == null || cursoSolicitadoRef.current === cursoId) return;
    cursoSolicitadoRef.current = cursoId;
    cargarCursoDetalle(cursoId);
  }, [open, cursoId, cargarCursoDetalle]);

  const guardar = useCallback(async () => {
    setErrorGuardar(null);
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return; // los errores de campo ya se muestran en el formulario
    }
    const payload = buildInscripcionUpdatePayload(values, inscripcion, {
      incluirGrupo: grupoMotivoDeshabilitado == null,
    });
    if (Object.keys(payload).length === 0) {
      message.info('No hay cambios que guardar');
      cerrar();
      return;
    }
    const result = await actualizarInscripcion(payload);
    if (!result?.success) {
      setErrorGuardar(result?.error || 'No se pudo guardar la inscripción');
      return;
    }
    message.success('Inscripción actualizada');
    cerrar();
  }, [form, inscripcion, grupoMotivoDeshabilitado, actualizarInscripcion, message, cerrar]);

  return {
    open,
    abrir,
    cerrar,
    guardar,
    guardando: actualizandoInscripcion,
    errorGuardar,
    form,
    initialValues,
    grupoOptions,
    grupoMotivoDeshabilitado,
    loadingGrupos: loadingCursoDetalle,
    errorGrupos: errorCursoDetalle,
  };
};
