/**
 * Tab prerrequisitos — asignatura seleccionada + listas + alta/baja.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App } from 'antd';

export const usePlanPrerrequisitosPanel = ({ planId, asignaturaCatalog, api }) => {
  const { message } = App.useApp();
  const [asignaturaId, setAsignaturaId] = useState(null);
  const [prerrequisitos, setPrerrequisitos] = useState([]);
  const [esPrerrequisitoDe, setEsPrerrequisitoDe] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [nuevoPrerrequisitoId, setNuevoPrerrequisitoId] = useState(null);

  const catalogById = useMemo(() => {
    const m = new Map();
    asignaturaCatalog.forEach((a) => m.set(a.id, a));
    return m;
  }, [asignaturaCatalog]);

  const asignaturaActual = asignaturaId ? catalogById.get(asignaturaId) : null;

  const opcionesPrerrequisito = useMemo(() => {
    if (!asignaturaActual) return [];
    const numeroActual = Number(asignaturaActual.periodoNumero ?? 0);
    return asignaturaCatalog
      .filter((a) => a.id !== asignaturaId && Number(a.periodoNumero ?? 0) < numeroActual)
      .map((a) => ({ value: a.id, label: a.label }));
  }, [asignaturaActual, asignaturaCatalog, asignaturaId]);

  const labelForAsignatura = useCallback(
    (id) => catalogById.get(id)?.label ?? `Asignatura #${id}`,
    [catalogById],
  );

  const loadDeps = useCallback(async () => {
    if (!asignaturaId) {
      setPrerrequisitos([]);
      setEsPrerrequisitoDe([]);
      return;
    }
    setLoading(true);
    try {
      const [reqRes, deRes] = await Promise.all([
        api.listarPrerrequisitos(asignaturaId),
        api.listarEsPrerrequisitoDe(asignaturaId),
      ]);
      if (!reqRes.success) throw new Error(reqRes.error);
      if (!deRes.success) throw new Error(deRes.error);
      setPrerrequisitos(reqRes.data ?? []);
      setEsPrerrequisitoDe(deRes.data ?? []);
    } catch (e) {
      message.error(e?.message || 'Error al cargar prerrequisitos');
      setPrerrequisitos([]);
      setEsPrerrequisitoDe([]);
    } finally {
      setLoading(false);
    }
  }, [api, asignaturaId, message]);

  useEffect(() => {
    loadDeps();
    setNuevoPrerrequisitoId(null);
  }, [loadDeps]);

  const handleAgregar = useCallback(async () => {
    if (!asignaturaId || !nuevoPrerrequisitoId) {
      message.warning('Seleccione la asignatura y el prerrequisito');
      return;
    }
    const prereq = catalogById.get(nuevoPrerrequisitoId);
    const actual = catalogById.get(asignaturaId);
    if (!prereq || !actual) return;

    if (Number(prereq.periodoNumero ?? 0) >= Number(actual.periodoNumero ?? 0)) {
      message.error('El prerrequisito debe pertenecer a un periodo anterior');
      return;
    }

    setAddingId(nuevoPrerrequisitoId);
    try {
      const result = await api.crearPrerrequisito({
        plan_estudio_id: planId,
        asignatura_id: asignaturaId,
        prerrequisito_id: nuevoPrerrequisitoId,
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      message.success('Prerrequisito agregado');
      setNuevoPrerrequisitoId(null);
      await loadDeps();
    } catch (e) {
      message.error(e?.message || 'No se pudo agregar el prerrequisito');
    } finally {
      setAddingId(null);
    }
  }, [api, asignaturaId, catalogById, loadDeps, message, nuevoPrerrequisitoId, planId]);

  const handleEliminar = useCallback(
    async (prerrequisitoRecordId) => {
      try {
        const result = await api.eliminarPrerrequisito(prerrequisitoRecordId);
        if (!result.success) {
          throw new Error(result.error);
        }
        message.success('Prerrequisito eliminado');
        await loadDeps();
      } catch (e) {
        message.error(e?.message || 'No se pudo eliminar');
      }
    },
    [api, loadDeps, message],
  );

  return {
    asignaturaId,
    setAsignaturaId,
    asignaturaActual,
    prerrequisitos,
    esPrerrequisitoDe,
    loading,
    opcionesPrerrequisito,
    nuevoPrerrequisitoId,
    setNuevoPrerrequisitoId,
    addingId,
    handleAgregar,
    handleEliminar,
    labelForAsignatura,
    asignaturaOptions: asignaturaCatalog.map((a) => ({ value: a.id, label: a.label })),
  };
};
