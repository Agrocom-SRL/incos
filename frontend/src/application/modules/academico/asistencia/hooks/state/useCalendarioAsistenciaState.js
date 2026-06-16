/**
 * Estado de la pantalla CALENDARIO MENSUAL de asistencia (bimestre activo del curso).
 *
 * Orquesta: carga del calendario, navegación al armado semanal de un día/semana,
 * habilitar fecha especial, y cierre/reapertura del registro (permiso EDITAR).
 * No contiene UI; la página solo compone.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { App } from 'antd';
import { useAuth } from '@application-auth';
import { useCalendarioAsistenciaApi } from '../api/useCalendarioAsistenciaApi.js';
import { useRegistroCierreApi } from '../api/useRegistroCierreApi.js';
import { useSesionEspecialApi } from '../api/useSesionEspecialApi.js';
import { ASISTENCIA_PERMISOS } from '../../utils/asistenciaPermisos.js';
import { createAsistenciaBreadcrumbItems } from '../../utils/asistenciaBreadcrumbs.js';
import {
  MIS_CURSOS_PATH,
  planillaCursoPath,
} from '../../utils/asistenciaPaths.js';
import { ESTADOS_REGISTRO } from '../../utils/asistenciaEstados.js';
import { semanaDeFecha } from '../../utils/asistenciaSemanas.js';

export const useCalendarioAsistenciaState = () => {
  const { asignacionId } = useParams();
  const { notification } = App.useApp();
  const { hasPermiso } = useAuth();

  const { calendario, loading, error, fetch } = useCalendarioAsistenciaApi();
  const { cerrar, reabrir, procesando } = useRegistroCierreApi();
  const { crear: crearSesion, creando } = useSesionEspecialApi();

  const puedeEditar = hasPermiso(ASISTENCIA_PERMISOS.registroCuaderno, 'EDITAR');

  const cargar = useCallback(() => {
    if (asignacionId) fetch(asignacionId, {});
  }, [asignacionId, fetch]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const dias = useMemo(() => calendario?.dias ?? [], [calendario]);
  const rango = calendario?.rango ?? null;
  const registroEstado = calendario?.registroEstado ?? ESTADOS_REGISTRO.ABIERTO;
  const registroCerrado = registroEstado === ESTADOS_REGISTRO.CERRADO;
  const bimestre = calendario?.bimestre ?? null;
  const curso = calendario?.curso ?? null;

  const breadcrumbItems = useMemo(
    () =>
      createAsistenciaBreadcrumbItems('ACA-ASI-CALENDARIO', 'ACA-ASI', null, {
        asignacionId,
      }),
    [asignacionId],
  );

  /** Path a la planilla semanal: si se pasa una fecha, acota a esa semana del bimestre. */
  const planillaPath = useCallback(
    (fecha) => {
      if (fecha && rango) {
        const semana = semanaDeFecha(fecha, rango);
        return planillaCursoPath(asignacionId, semana);
      }
      return planillaCursoPath(asignacionId);
    },
    [asignacionId, rango],
  );

  const cerrarRegistro = useCallback(async () => {
    const res = await cerrar(asignacionId, { bimestre });
    if (!res?.success) {
      notification.error({
        title: 'No se pudo cerrar el registro',
        description: res?.error || 'Reintentá en unos segundos.',
      });
      return false;
    }
    notification.success({
      title: 'Registro cerrado',
      description: 'La asistencia del bimestre quedó en solo lectura.',
    });
    await cargar();
    return true;
  }, [cerrar, asignacionId, bimestre, notification, cargar]);

  const reabrirRegistro = useCallback(async () => {
    const res = await reabrir(asignacionId, { bimestre });
    if (!res?.success) {
      notification.error({
        title: 'No se pudo reabrir el registro',
        description: res?.error || 'Reintentá en unos segundos.',
      });
      return false;
    }
    notification.success({
      title: 'Registro reabierto',
      description: 'Podés corregir la asistencia del bimestre.',
    });
    await cargar();
    return true;
  }, [reabrir, asignacionId, bimestre, notification, cargar]);

  const habilitarFechaEspecial = useCallback(
    async ({ fecha, motivo, horaInicio, horaFin }) => {
      const res = await crearSesion(asignacionId, { fecha, motivo, horaInicio, horaFin });
      if (!res?.success) {
        notification.error({
          title: 'No se pudo habilitar la fecha',
          description: res?.error || 'Reintentá en unos segundos.',
        });
        return false;
      }
      notification.success({
        title: 'Fecha especial habilitada',
        description: 'Ya podés tomar asistencia en ese día.',
      });
      await cargar();
      return true;
    },
    [crearSesion, asignacionId, notification, cargar],
  );

  return {
    asignacionId,
    curso,
    bimestre,
    dias,
    rango,
    registroEstado,
    registroCerrado,
    puedeEditar,
    isLoading: loading,
    error,
    refetch: cargar,
    breadcrumbItems,
    volverPath: MIS_CURSOS_PATH,
    planillaPath,
    cerrarRegistro,
    reabrirRegistro,
    habilitarFechaEspecial,
    procesandoRegistro: procesando,
    creandoSesion: creando,
  };
};
