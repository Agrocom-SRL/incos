import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, message } from 'antd';
import { useOfertaAcademicaApi } from '@application-institucional/oferta';
import { useAsignacionDocenteApi } from '../api/useAsignacionDocenteApi.js';
import {
  buildMatrizRows,
  mapCargaDocentesIndex,
} from '../../mappers/asignacionDocenteMatrizMapper.js';

function extractApiErrorFlags(raw) {
  const err = raw?.response?.data?.error;
  if (!err || typeof err !== 'object') return {};
  return {
    requiereColor: Boolean(err.requiere_color),
    sobrecarga: Boolean(err.sobrecarga),
    message: err.message,
  };
}

export function useAsignacionDocenteMatrizState() {
  const ofertaApi = useOfertaAcademicaApi();
  const api = useAsignacionDocenteApi();

  const [gestiones, setGestiones] = useState([]);
  const [selectedGestionId, setSelectedGestionId] = useState(null);
  const [planesHabilitados, setPlanesHabilitados] = useState([]);
  const [selectedGestionPlanId, setSelectedGestionPlanId] = useState(null);
  const [paralelosGestion, setParalelosGestion] = useState([]);
  const [selectedParaleloGestionId, setSelectedParaleloGestionId] = useState(null);

  const [matrizRows, setMatrizRows] = useState([]);
  const [cobertura, setCobertura] = useState(null);
  const [cargaPorDocente, setCargaPorDocente] = useState(new Map());
  const [loadingMatriz, setLoadingMatriz] = useState(false);
  const [savingOfertaId, setSavingOfertaId] = useState(null);

  const [colorPicker, setColorPicker] = useState({
    open: false,
    docenteId: null,
    docenteNombre: '',
    pendingOfertaCursoId: null,
    confirmOverload: false,
  });

  const gestionSeleccionada = useMemo(
    () => gestiones.find((g) => g.id === selectedGestionId) ?? null,
    [gestiones, selectedGestionId]
  );

  const planSeleccionado = useMemo(
    () => planesHabilitados.find((p) => p.id === selectedGestionPlanId) ?? null,
    [planesHabilitados, selectedGestionPlanId]
  );

  const paraleloSeleccionado = useMemo(
    () => paralelosGestion.find((p) => p.id === selectedParaleloGestionId) ?? null,
    [paralelosGestion, selectedParaleloGestionId]
  );

  const loadGestiones = useCallback(async () => {
    const res = await ofertaApi.fetchGestiones();
    if (!res.success) return;
    const raw = res.data?.gestiones ?? res.data?.managements ?? res.data;
    const list = Array.isArray(raw) ? raw : [];
    setGestiones(list);
    const vigente = list.find((g) => g.vigente);
    if (vigente && !selectedGestionId) {
      setSelectedGestionId(vigente.id);
    }
  }, [ofertaApi, selectedGestionId]);

  const loadPlanes = useCallback(async () => {
    if (!selectedGestionId) return;
    const res = await ofertaApi.fetchPlanesHabilitados(selectedGestionId);
    if (!res.success) return;
    setPlanesHabilitados(res.data?.planesHabilitados ?? []);
  }, [ofertaApi, selectedGestionId]);

  const loadParalelos = useCallback(async () => {
    if (!selectedGestionPlanId) return;
    const res = await ofertaApi.fetchParalelosGestion(selectedGestionPlanId);
    if (!res.success) return;
    setParalelosGestion(res.data?.paralelosGestion ?? []);
  }, [ofertaApi, selectedGestionPlanId]);

  const loadMatriz = useCallback(async () => {
    if (!selectedParaleloGestionId || !selectedGestionPlanId || !selectedGestionId) {
      setMatrizRows([]);
      setCobertura(null);
      return;
    }

    setLoadingMatriz(true);
    try {
      const [ofertaRes, asigRes, cobRes, cargaRes] = await Promise.all([
        api.fetchOfertaCursos(selectedParaleloGestionId),
        api.fetchAsignaciones({ paralelo_gestion_id: selectedParaleloGestionId }),
        api.fetchCobertura(selectedParaleloGestionId),
        api.fetchCargaGestion(selectedGestionId),
      ]);

      const ofertaCursos = ofertaRes.success ? ofertaRes.data?.ofertaCursos ?? [] : [];
      const asignaciones = asigRes.success ? asigRes.data?.asignaciones ?? [] : [];
      setMatrizRows(buildMatrizRows(ofertaCursos, asignaciones));
      setCobertura(cobRes.success ? cobRes.data?.cobertura_docente ?? null : null);
      setCargaPorDocente(
        cargaRes.success ? mapCargaDocentesIndex(cargaRes.data?.carga_docentes) : new Map()
      );
    } finally {
      setLoadingMatriz(false);
    }
  }, [api, selectedParaleloGestionId, selectedGestionPlanId, selectedGestionId]);

  useEffect(() => {
    loadGestiones();
  }, []);

  useEffect(() => {
    setSelectedGestionPlanId(null);
    setSelectedParaleloGestionId(null);
    setPlanesHabilitados([]);
    setParalelosGestion([]);
    if (selectedGestionId) loadPlanes();
  }, [selectedGestionId]);

  useEffect(() => {
    setSelectedParaleloGestionId(null);
    setParalelosGestion([]);
    if (selectedGestionPlanId) loadParalelos();
  }, [selectedGestionPlanId]);

  useEffect(() => {
    loadMatriz();
  }, [loadMatriz]);

  const onGestionChange = useCallback((id) => {
    setSelectedGestionId(id ?? null);
  }, []);

  const onPlanChange = useCallback((id) => {
    setSelectedGestionPlanId(id ?? null);
  }, []);

  const onParaleloChange = useCallback((id) => {
    setSelectedParaleloGestionId(id ?? null);
  }, []);

  const closeColorPicker = useCallback(() => {
    setColorPicker({
      open: false,
      docenteId: null,
      docenteNombre: '',
      pendingOfertaCursoId: null,
      confirmOverload: false,
    });
  }, []);

  const submitAsignacion = useCallback(
    async ({ ofertaCursoId, docenteId, docenteNombre = '', confirmOverload = false }) => {
      if (!selectedGestionPlanId || !ofertaCursoId || !docenteId) return false;

      setSavingOfertaId(ofertaCursoId);
      const res = await api.createAsignacion({
        gestion_plan_id: selectedGestionPlanId,
        oferta_curso_id: ofertaCursoId,
        docente_id: docenteId,
        confirmar_sobrecarga: confirmOverload,
      });
      setSavingOfertaId(null);

      if (res.success) {
        message.success('Docente asignado');
        await loadMatriz();
        return true;
      }

      const flags = extractApiErrorFlags(res.raw);
      if (flags.requiereColor) {
        setColorPicker({
          open: true,
          docenteId,
          docenteNombre: docenteNombre || '',
          pendingOfertaCursoId: ofertaCursoId,
          confirmOverload,
        });
        message.warning('Asigne un color al docente antes de continuar');
        return false;
      }

      if (flags.sobrecarga) {
        Modal.confirm({
          title: 'Sobrecarga docente',
          content:
            flags.message ||
            'La asignación supera el máximo semanal del docente. ¿Desea confirmar bajo su responsabilidad?',
          okText: 'Confirmar asignación',
          cancelText: 'Cancelar',
          onOk: async () => {
            await submitAsignacion({
              ofertaCursoId,
              docenteId,
              docenteNombre,
              confirmOverload: true,
            });
          },
        });
        return false;
      }

      message.error(typeof res.error === 'string' ? res.error : 'No se pudo asignar el docente');
      return false;
    },
    [api, selectedGestionPlanId, loadMatriz]
  );

  const onSelectDocente = useCallback(
    async (ofertaCursoId, docenteId, docenteNombre) => {
      if (!docenteId) return;
      await submitAsignacion({ ofertaCursoId, docenteId, docenteNombre: docenteNombre ?? '' });
    },
    [submitAsignacion, colorPicker]
  );

  const onQuitarAsignacion = useCallback(
    async (asignacionId) => {
      if (!asignacionId) return;
      const res = await api.deleteAsignacion(asignacionId);
      if (res.success) {
        message.success('Asignación retirada');
        await loadMatriz();
      } else {
        message.error(typeof res.error === 'string' ? res.error : 'No se pudo quitar la asignación');
      }
    },
    [api, loadMatriz]
  );

  const onColorSaved = useCallback(async () => {
    const { pendingOfertaCursoId, docenteId, docenteNombre, confirmOverload } = colorPicker;
    closeColorPicker();
    if (pendingOfertaCursoId && docenteId) {
      await submitAsignacion({
        ofertaCursoId: pendingOfertaCursoId,
        docenteId,
        docenteNombre: docenteNombre ?? '',
        confirmOverload,
      });
    } else {
      await loadMatriz();
    }
  }, [colorPicker, closeColorPicker, submitAsignacion, loadMatriz]);

  const openColorPickerForDocente = useCallback((docenteId, docenteNombre) => {
    setColorPicker({
      open: true,
      docenteId,
      docenteNombre: docenteNombre ?? '',
      pendingOfertaCursoId: null,
      confirmOverload: false,
    });
  }, []);

  return {
    gestiones,
    selectedGestionId,
    planesHabilitados,
    selectedGestionPlanId,
    paralelosGestion,
    selectedParaleloGestionId,
    gestionSeleccionada,
    planSeleccionado,
    paraleloSeleccionado,
    matrizRows,
    cobertura,
    cargaPorDocente,
    loadingMatriz,
    savingOfertaId,
    loadingCatalogos: ofertaApi.loading || loadingMatriz,
    errorCatalogos: ofertaApi.error,
    onGestionChange,
    onPlanChange,
    onParaleloChange,
    onSelectDocente,
    onQuitarAsignacion,
    reloadMatriz: loadMatriz,
    colorPicker,
    closeColorPicker,
    onColorSaved,
    openColorPickerForDocente,
    updateDocenteColor: api.updateDocenteColor,
    fetchColoresSugeridos: api.fetchColoresSugeridos,
    fetchCargaDocente: api.fetchCargaDocente,
  };
}
