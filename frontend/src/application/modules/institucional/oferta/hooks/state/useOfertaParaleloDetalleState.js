import { useCallback, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { ofertaPaths } from '../../config/paths.js';
import { useOfertaAcademicaApi } from '../api/useOfertaAcademicaApi.js';

/**
 * Detalle de paralelo_gestion — stub inicial (cabecera + tabla oferta básica).
 */
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
  } = useOfertaAcademicaApi();

  const [detalle, setDetalle] = useState(null);
  const [ofertaCursos, setOfertaCursos] = useState([]);

  const load = useCallback(async () => {
    if (!Number.isFinite(paraleloGestionId) || paraleloGestionId < 1) return;
    const [det, oferta] = await Promise.all([
      fetchParaleloGestionDetalle(paraleloGestionId),
      fetchOfertaCursos(paraleloGestionId),
    ]);
    if (det.success) setDetalle(det.data?.paraleloGestion ?? det.data);
    if (oferta.success) setOfertaCursos(oferta.data?.ofertaCursos ?? []);
  }, [fetchParaleloGestionDetalle, fetchOfertaCursos, paraleloGestionId]);

  useEffect(() => {
    load();
  }, [load]);

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
      return ofertaPaths.paralelosGestion(detalle.gestionId, detalle.gestionPlanId);
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
    pageTitle,
    onMarcarOfertado,
    load,
    navigateBack,
    navigateHorariosArmado,
  };
}
