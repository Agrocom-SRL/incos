import { useCallback, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { ofertaPaths } from '../../config/paths.js';
import { useOfertaAcademicaApi } from '../api/useOfertaAcademicaApi.js';

export function useOfertaParaleloDetalleState() {
  const { paraleloGestionId: idParam } = useParams();
  const paraleloGestionId = Number(idParam);
  const navigate = useNavigate();
  const {
    loading: apiLoading,
    error: apiError,
    fetchParaleloGestionDetalle,
    fetchOfertaCursos,
    updateParaleloGestionEstado,
    validarOferta,
  } = useOfertaAcademicaApi();

  const [detalle, setDetalle] = useState(null);
  const [ofertaCursos, setOfertaCursos] = useState([]);
  const [validacion, setValidacion] = useState(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(paraleloGestionId) || paraleloGestionId < 1) return;
    const [det, oferta, val] = await Promise.all([
      fetchParaleloGestionDetalle(paraleloGestionId),
      fetchOfertaCursos(paraleloGestionId),
      validarOferta(paraleloGestionId),
    ]);
    if (det.success) setDetalle(det.data?.paraleloGestion ?? det.data);
    if (oferta.success) setOfertaCursos(oferta.data?.ofertaCursos ?? []);
    if (val.success) setValidacion(val.data?.validacion ?? val.data);
  }, [fetchParaleloGestionDetalle, fetchOfertaCursos, validarOferta, paraleloGestionId]);

  useEffect(() => {
    load();
  }, [load]);

  const cargaHorariaResumen = useMemo(() => {
    const horasPlan = Number(validacion?.horas_total ?? 0);
    const materiasEsperadas = Number(validacion?.asignaturas_esperadas ?? 0);
    const materiasOfertadas = Number(validacion?.oferta_actual ?? ofertaCursos.length);
    const horasOfertadas = ofertaCursos.reduce(
      (sum, c) => sum + (Number(c.horasSemanales) || 0),
      0
    );
    const faltantes = Array.isArray(validacion?.faltantes) ? validacion.faltantes : [];
    return {
      horasPlan,
      horasOfertadas,
      materiasEsperadas,
      materiasOfertadas,
      faltantes,
      valido: Boolean(validacion?.valido),
      completo: validacion?.valido && horasPlan > 0 && horasOfertadas >= horasPlan,
    };
  }, [validacion, ofertaCursos]);

  const onMarcarOfertado = useCallback(async () => {
    const res = await updateParaleloGestionEstado(paraleloGestionId, 'OFERTADO');
    if (res.success) {
      message.success('Paralelo marcado como OFERTADO');
      await load();
    }
  }, [updateParaleloGestionEstado, paraleloGestionId, load]);

  const pageTitle = detalle?.paraleloNombre
    ? `Paralelo ${detalle.paraleloNombre}`
    : `Paralelo #${paraleloGestionId}`;

  const returnPath = useMemo(() => {
    if (detalle?.gestionPlanId && detalle?.gestionId) {
      return ofertaPaths.gestionPlanesConPlan(detalle.gestionId, detalle.gestionPlanId);
    }
    return ofertaPaths.dashboard();
  }, [detalle]);

  const navigateBack = useCallback(() => navigate(returnPath), [navigate, returnPath]);
  const navigateHorariosArmado = useCallback(
    () => navigate(`/institucional/horarios/armado?pg=${paraleloGestionId}`),
    [navigate, paraleloGestionId]
  );

  return {
    paraleloGestionId,
    apiLoading,
    apiError,
    detalle,
    ofertaCursos,
    validacion,
    cargaHorariaResumen,
    pageTitle,
    onMarcarOfertado,
    load,
    navigateBack,
    navigateHorariosArmado,
  };
}
