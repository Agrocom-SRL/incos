import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Form } from 'antd';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import apiClient from '@api-client';
import { HORARIOS_DOCENTE_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse, handleSuccessResponse } from '@api/responseHandler';
import { useAuth, esDocente } from '@application-auth';
import { useGestionesCatalogApi } from '@application-shared/hooks';
import { useGetDocenteById } from '@application-docentes/hooks/api';
import { useDocenteColorApi } from '@application-docentes/hooks/api/useDocenteColorApi';
import {
  normalizeDocenteAsignacionesTab,
  ofertaPaths,
  OFERTA_BASE,
} from '../../config/paths.js';
import { filterAssignmentsGestionVigente } from '../../utils/filterAssignmentsGestionVigente.js';
import { buildDocenteAsignacionesTabla } from '../../utils/buildDocenteAsignacionesTabla.js';
import { mapDocenteGrillaConflictosFromApi } from '@application-institucional/horarios/mappers/docenteGrillaConflictosMapper';
import { buildHorarioSlotIndexFromFranjas } from '@application-institucional/horarios/utils/buildHorarioSlotIndex';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

export function useDocenteAsignacionesState() {
  const { docenteId: idParam } = useParams();
  const docenteId = Number(idParam);
  const validDocenteId = Number.isFinite(docenteId) && docenteId > 0 ? docenteId : null;

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  // Rama docente self (entra por el ítem "Mis asignaciones"): el breadcrumb del
  // ítem debe reflejar la etiqueta con la que entró, no la administrativa.
  const { usuario } = useAuth();
  const esVistaDocente = esDocente(usuario);

  const tab = normalizeDocenteAsignacionesTab(searchParams.get('tab'));

  const { gestiones } = useGestionesCatalogApi();
  const gestionVigente = useMemo(() => {
    const list = Array.isArray(gestiones) ? gestiones : [];
    return list.find((g) => g.vigente) ?? list[0] ?? null;
  }, [gestiones]);
  const gestionVigenteId = useMemo(() => {
    const id = gestionVigente?.id != null ? Number(gestionVigente.id) : null;
    return Number.isFinite(id) && id > 0 ? id : null;
  }, [gestionVigente]);

  const { docente, loading: docenteLoading, error: docenteError, getDocenteById } = useGetDocenteById();
  const { updateDocenteColor } = useDocenteColorApi();

  const [grillaLoading, setGrillaLoading] = useState(false);
  const [grillaError, setGrillaError] = useState(null);
  const [grillaRaw, setGrillaRaw] = useState(null);
  const [savingColor, setSavingColor] = useState(false);

  const grilla = useMemo(() => mapDocenteGrillaConflictosFromApi(grillaRaw), [grillaRaw]);
  const schedules = grilla?.courseSchedules ?? [];
  const horarioSlotIndex = useMemo(
    () => buildHorarioSlotIndexFromFranjas(grilla?.franjas ?? []),
    [grilla?.franjas],
  );
  const turnoEfectivo = grilla?.turnoEfectivo ?? null;

  const profile = docente?.profile ?? {};
  const docenteNombre =
    grilla?.docenteNombre ||
    profile.nombreCompleto ||
    (validDocenteId ? `Docente #${validDocenteId}` : 'Docente');

  const gestionLabel = gestionVigente
    ? gestionVigente.nombre || gestionVigente.gestion || gestionVigente.id
    : null;

  const assignmentsGestion = useMemo(
    () => filterAssignmentsGestionVigente(docente?.assignments ?? [], gestionVigente),
    [docente?.assignments, gestionVigente],
  );

  const tablaAsignaciones = useMemo(
    () =>
      buildDocenteAsignacionesTabla({
        profile,
        docenteId: validDocenteId,
        assignments: assignmentsGestion,
        gestionLabel,
      }),
    [profile, validDocenteId, assignmentsGestion, gestionLabel],
  );

  const colorHexInicial = useMemo(() => {
    const fromGrilla = sanitizeDocenteColorHex(grilla?.colorHex);
    if (fromGrilla) return fromGrilla;
    return sanitizeDocenteColorHex(profile.colorHex) || '';
  }, [grilla?.colorHex, profile.colorHex]);

  const fetchGrilla = useCallback(async () => {
    if (!validDocenteId || !gestionVigenteId) {
      setGrillaRaw(null);
      setGrillaError(null);
      return;
    }
    setGrillaLoading(true);
    setGrillaError(null);
    try {
      const response = await apiClient.get(
        HORARIOS_DOCENTE_ENDPOINTS.GRILLA_CONFLICTOS(validDocenteId, gestionVigenteId),
      );
      const result = handleSuccessResponse(response);
      if (!result.success) {
        setGrillaError(result.error || 'No se pudo cargar el horario del docente');
        setGrillaRaw(null);
        return;
      }
      setGrillaRaw(result.data);
    } catch (err) {
      const fail = handleErrorResponse(err, 'No se pudo cargar el horario del docente');
      setGrillaError(fail.error);
      setGrillaRaw(null);
    } finally {
      setGrillaLoading(false);
    }
  }, [validDocenteId, gestionVigenteId]);

  useEffect(() => {
    if (!validDocenteId) return;
    getDocenteById(validDocenteId);
  }, [validDocenteId, getDocenteById]);

  useEffect(() => {
    fetchGrilla();
  }, [fetchGrilla]);

  useEffect(() => {
    form.setFieldsValue({ colorHex: colorHexInicial || undefined });
  }, [form, colorHexInicial]);

  const onTabChange = useCallback(
    (key) => {
      const next = new URLSearchParams(searchParams);
      next.set('tab', key);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const returnPath = useMemo(() => {
    const fromState = location.state?.returnListPath;
    if (typeof fromState === 'string' && fromState.trim()) {
      return fromState.trim();
    }
    return OFERTA_BASE;
  }, [location.state]);

  const handleVolver = useCallback(() => {
    navigate(returnPath, {
      state: location.state?.menuSidebarKey
        ? { menuSidebarKey: location.state.menuSidebarKey }
        : undefined,
    });
  }, [navigate, returnPath, location.state]);

  const handleGuardarColor = useCallback(async () => {
    if (!validDocenteId) return;
    let values;
    try {
      values = await form.validateFields(['colorHex']);
    } catch {
      return;
    }
    const hex = sanitizeDocenteColorHex(values.colorHex);
    if (!hex) {
      notification.warning({
        title: 'Color requerido',
        description: 'Elegí un color en formato #RRGGBB antes de guardar.',
      });
      return;
    }
    setSavingColor(true);
    const res = await updateDocenteColor(validDocenteId, hex);
    setSavingColor(false);
    if (res.success) {
      notification.success({
        title: 'Color actualizado',
        description: 'El identificador visual del docente quedó guardado.',
      });
      getDocenteById(validDocenteId);
      fetchGrilla();
      return;
    }
    notification.error({
      title: 'No se pudo guardar',
      description: typeof res.error === 'string' ? res.error : 'Error al actualizar el color.',
    });
  }, [
    validDocenteId,
    form,
    updateDocenteColor,
    notification,
    getDocenteById,
    fetchGrilla,
  ]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Institucional', href: '/institucional' },
      { title: esVistaDocente ? 'Mis asignaciones' : 'Oferta Académica', href: OFERTA_BASE },
      { title: docenteNombre },
    ],
    [docenteNombre, esVistaDocente],
  );

  const pageTitle = `Asignaciones — ${docenteNombre}`;
  const loading = docenteLoading || grillaLoading;
  const error = !validDocenteId
    ? 'Identificador de docente inválido'
    : docenteError || grillaError || null;

  return {
    validDocenteId,
    tab,
    onTabChange,
    form,
    loading,
    error,
    schedules,
    horarioSlotIndex,
    turnoEfectivo,
    docenteNombre,
    gestionLabel,
    tablaAsignaciones,
    colorHexInicial,
    savingColor,
    handleGuardarColor,
    handleVolver,
    breadcrumbItems,
    pageTitle,
    docenteAsignacionesPath: validDocenteId
      ? ofertaPaths.docenteAsignaciones(validDocenteId)
      : OFERTA_BASE,
  };
}
