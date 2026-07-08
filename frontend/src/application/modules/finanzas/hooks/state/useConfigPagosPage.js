/**
 * Hook de pantalla: configuración de pagos (Finanzas).
 *
 * Orquesta la pantalla "Config. de pagos" (gemela de `PoliticaInstitucionalPage`
 * de calificaciones): consume el contexto del provider, expone breadcrumbs y los
 * handlers de guardado por sección (con `message` de éxito + refetch), además del
 * estado de los modales de banco/cuenta. No hace fetch (eso vive en el provider).
 *
 * Reglas de negocio:
 *   - Métodos: solo nombre/activo (los 4 son fijos).
 *   - Bancos/Cuentas: alta y edición; "quitar" = desactivar (switch activo).
 *   - Cuenta: el QR se envía como archivo (`qr`) → FormData en el repositorio.
 *
 * El aporte de la gestión vigente (UPSERT) vive en la página
 * `/finanzas/configuracion/aportes` (sin ítem de menú propio, `useAportePage`),
 * con su permiso `finanzas.aporte`.
 */

import { useCallback, useMemo, useState } from 'react';
import { App } from 'antd';
import { useConfigPagosContext } from '@application-finanzas/hooks/context/useConfigPagosContext';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';

export const useConfigPagosPage = () => {
  const { message } = App.useApp();
  const {
    metodos,
    bancos,
    cuentas,
    loading,
    error,
    refetch,
    saving,
    actualizarMetodoPago,
    guardarBanco,
    guardarCuenta,
  } = useConfigPagosContext();

  // Estado de modales (método / banco / cuenta): null → cerrado; objeto → editar.
  const [metodoEnEdicion, setMetodoEnEdicion] = useState(null);
  const [metodoModalAbierto, setMetodoModalAbierto] = useState(false);
  const [bancoEnEdicion, setBancoEnEdicion] = useState(null);
  const [bancoModalAbierto, setBancoModalAbierto] = useState(false);
  const [cuentaEnEdicion, setCuentaEnEdicion] = useState(null);
  const [cuentaModalAbierto, setCuentaModalAbierto] = useState(false);

  const breadcrumbItems = useMemo(
    () => createBreadcrumbItems('FIN-CFG', 'FIN', 'Config. de pagos'),
    [],
  );

  /** Resuelve el resultado de una mutación: feedback + refetch en caso de éxito. */
  const resolver = useCallback(
    async (resultado, exitoMsg) => {
      if (resultado?.success) {
        message.success(exitoMsg);
        await refetch();
        return true;
      }
      message.error(resultado?.error || 'No se pudo guardar. Reintentar.');
      return false;
    },
    [message, refetch],
  );

  // ── Sección 1: Métodos de pago (modal de nombre + toggle activo) ──────────
  const abrirMetodoModal = useCallback((metodo) => {
    setMetodoEnEdicion(metodo);
    setMetodoModalAbierto(true);
  }, []);

  const cerrarMetodoModal = useCallback(() => {
    setMetodoModalAbierto(false);
    setMetodoEnEdicion(null);
  }, []);

  const guardarMetodo = useCallback(
    async (id, payload) => {
      const resultado = await actualizarMetodoPago(id, payload);
      const ok = await resolver(resultado, 'Método de pago actualizado');
      if (ok) cerrarMetodoModal();
      return ok;
    },
    [actualizarMetodoPago, resolver, cerrarMetodoModal],
  );

  const toggleMetodoActivo = useCallback(
    async (metodo, activo) => {
      const resultado = await actualizarMetodoPago(metodo.id, { activo });
      return resolver(resultado, activo ? 'Método activado' : 'Método desactivado');
    },
    [actualizarMetodoPago, resolver],
  );

  // ── Sección 2: Bancos autorizados (modal + toggle) ────────────────────────
  const abrirBancoModal = useCallback((banco = null) => {
    setBancoEnEdicion(banco);
    setBancoModalAbierto(true);
  }, []);

  const cerrarBancoModal = useCallback(() => {
    setBancoModalAbierto(false);
    setBancoEnEdicion(null);
  }, []);

  const guardarBancoSubmit = useCallback(
    async (values) => {
      const payload = {
        codigo: values.codigo?.trim(),
        nombre: values.nombre?.trim(),
        metodo_pago_id: values.metodoPagoId ?? null,
        activo: values.activo == null ? true : !!values.activo,
      };
      const id = bancoEnEdicion?.id ?? null;
      const resultado = await guardarBanco({ id, payload });
      const ok = await resolver(resultado, id != null ? 'Banco actualizado' : 'Banco agregado');
      if (ok) cerrarBancoModal();
      return ok;
    },
    [bancoEnEdicion, guardarBanco, resolver, cerrarBancoModal],
  );

  const toggleBancoActivo = useCallback(
    async (banco, activo) => {
      const resultado = await guardarBanco({ id: banco.id, payload: { activo } });
      return resolver(resultado, activo ? 'Banco activado' : 'Banco desactivado');
    },
    [guardarBanco, resolver],
  );

  // ── Sección 3: Cuentas de pago (modal + QR + toggle) ──────────────────────
  const abrirCuentaModal = useCallback((cuenta = null) => {
    setCuentaEnEdicion(cuenta);
    setCuentaModalAbierto(true);
  }, []);

  const cerrarCuentaModal = useCallback(() => {
    setCuentaModalAbierto(false);
    setCuentaEnEdicion(null);
  }, []);

  const guardarCuentaSubmit = useCallback(
    async (values) => {
      // `qr` es un File (opcional). El resto, solo se envía lo que aporta valor.
      const payload = {
        nombre_titular: values.nombreTitular?.trim(),
        metodo_pago_id: values.metodoPagoId ?? null,
        banco_id: values.bancoId ?? null,
        numero_cuenta: values.numeroCuenta?.trim() || null,
        numero_celular: values.numeroCelular?.trim() || null,
        activo: values.activo == null ? true : !!values.activo,
        qr: values.qr instanceof File ? values.qr : undefined,
      };
      const id = cuentaEnEdicion?.id ?? null;
      const resultado = await guardarCuenta({ id, payload });
      const ok = await resolver(resultado, id != null ? 'Cuenta actualizada' : 'Cuenta agregada');
      if (ok) cerrarCuentaModal();
      return ok;
    },
    [cuentaEnEdicion, guardarCuenta, resolver, cerrarCuentaModal],
  );

  const toggleCuentaActiva = useCallback(
    async (cuenta, activo) => {
      const resultado = await guardarCuenta({ id: cuenta.id, payload: { activo } });
      return resolver(resultado, activo ? 'Cuenta activada' : 'Cuenta desactivada');
    },
    [guardarCuenta, resolver],
  );

  return {
    // Contexto
    breadcrumbItems,
    // Datos
    metodos,
    bancos,
    cuentas,
    loading,
    error,
    refetch,
    saving,
    // Métodos
    metodoEnEdicion,
    metodoModalAbierto,
    abrirMetodoModal,
    cerrarMetodoModal,
    toggleMetodoActivo,
    guardarMetodo,
    // Bancos
    bancoEnEdicion,
    bancoModalAbierto,
    abrirBancoModal,
    cerrarBancoModal,
    guardarBancoSubmit,
    toggleBancoActivo,
    // Cuentas
    cuentaEnEdicion,
    cuentaModalAbierto,
    abrirCuentaModal,
    cerrarCuentaModal,
    guardarCuentaSubmit,
    toggleCuentaActiva,
  };
};

export default useConfigPagosPage;
