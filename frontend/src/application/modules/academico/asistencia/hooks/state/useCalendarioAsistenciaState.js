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
import { planillaCursoPath } from '../../utils/asistenciaPaths.js';
import { ESTADOS_REGISTRO } from '../../utils/asistenciaEstados.js';
import { semanaDeFecha } from '../../utils/asistenciaSemanas.js';

export const useCalendarioAsistenciaState = () => {
  const { asignacionId } = useParams();
  const { notification } = App.useApp();
  const { hasPermiso } = useAuth();

  const { calendario, loading, error, fetch } = useCalendarioAsistenciaApi();
  const { cerrar, reabrir, procesando } = useRegistroCierreApi();
  const { crear: crearSesion, creando, eliminar: eliminarSesion, eliminando } = useSesionEspecialApi();

  const puedeEditar = hasPermiso(ASISTENCIA_PERMISOS.registroCuaderno, 'EDITAR');

  // Drawer de fecha especial: abierto + fecha precargada + datos de la sesión existente
  // (modo edición/eliminación) cuando se abre desde un día que ya es sesión especial.
  const [fechaEspecial, setFechaEspecial] = useState({
    abierto: false,
    fecha: null,
    sesion: null,
  });

  // Crear: día del bimestre sin sesión todavía.
  const abrirFechaEspecial = useCallback((fecha = null) => {
    setFechaEspecial({ abierto: true, fecha, sesion: null });
  }, []);

  // Editar/eliminar: día que YA es sesión especial (precarga motivo/horas + si tiene marcas).
  const abrirEditarFechaEspecial = useCallback((dia) => {
    if (!dia?.fechaClase) return;
    setFechaEspecial({
      abierto: true,
      fecha: dia.fechaClase,
      sesion: {
        motivo: dia.motivo ?? '',
        horaInicio: dia.horaInicio ?? null,
        horaFin: dia.horaFin ?? null,
        tieneMarcas: Boolean(dia.tieneMarcas),
      },
    });
  }, []);

  const cerrarFechaEspecial = useCallback(() => {
    setFechaEspecial((prev) => ({ ...prev, abierto: false }));
  }, []);

  const cargar = useCallback(() => {
    if (asignacionId) fetch(asignacionId, {});
  }, [asignacionId, fetch]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const dias = useMemo(() => calendario?.dias ?? [], [calendario]);
  const actividadesSinClase = useMemo(
    () => calendario?.actividadesSinClase ?? [],
    [calendario],
  );
  const rango = calendario?.rango ?? null;
  const registroEstado = calendario?.registroEstado ?? ESTADOS_REGISTRO.ABIERTO;
  const registroCerrado = registroEstado === ESTADOS_REGISTRO.CERRADO;
  const bimestre = calendario?.bimestre ?? null;
  const bimestreNombre = calendario?.bimestreNombre ?? null;
  const bimestreColor = calendario?.bimestreColor ?? null;
  const gestion = calendario?.gestion ?? null;
  const anioCalendario = calendario?.anioCalendario ?? null;
  const hoy = calendario?.hoy ?? null;
  const resumen = calendario?.resumen ?? null;
  const horario = useMemo(() => calendario?.horario ?? [], [calendario]);
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

  const eliminarFechaEspecial = useCallback(
    async (fecha) => {
      const res = await eliminarSesion(asignacionId, fecha);
      if (!res?.success) {
        notification.error({
          title: 'No se pudo eliminar la fecha',
          description: res?.error || 'Reintentá en unos segundos.',
        });
        return false;
      }
      notification.success({
        title: 'Fecha especial eliminada',
        description: 'El día especial se quitó del calendario.',
      });
      await cargar();
      return true;
    },
    [eliminarSesion, asignacionId, notification, cargar],
  );

  return {
    asignacionId,
    curso,
    bimestre,
    bimestreNombre,
    bimestreColor,
    gestion,
    anioCalendario,
    hoy,
    resumen,
    horario,
    dias,
    actividadesSinClase,
    rango,
    registroEstado,
    registroCerrado,
    puedeEditar,
    isLoading: loading,
    error,
    refetch: cargar,
    breadcrumbItems,
    // El calendario se abre como administración DESDE la planilla; volver regresa allí.
    volverPath: planillaCursoPath(asignacionId),
    planillaPath,
    cerrarRegistro,
    reabrirRegistro,
    habilitarFechaEspecial,
    eliminarFechaEspecial,
    procesandoRegistro: procesando,
    creandoSesion: creando,
    eliminandoSesion: eliminando,
    // Drawer de fecha especial
    fechaEspecial,
    abrirFechaEspecial,
    abrirEditarFechaEspecial,
    cerrarFechaEspecial,
  };
};
