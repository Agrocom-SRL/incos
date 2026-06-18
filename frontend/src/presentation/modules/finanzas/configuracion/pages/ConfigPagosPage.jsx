/**
 * Configuración de pagos (Finanzas) — gestión vigente.
 *
 * Página "dumb" (gemela de `PoliticaInstitucionalPage`): compone template +
 * `PageHeader` + `Spin` (carga) / `Alert` (error) y las 4 secciones en Cards
 * (aporte, métodos, bancos, cuentas). Toda la orquestación vive en
 * `useConfigPagosPage` (hooks/state) + el provider; aquí no se hace fetch.
 */

import { useMemo } from 'react';
import { Alert, Button, Empty, Flex, Spin } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useConfigPagosPage } from '@application-finanzas/hooks/state/useConfigPagosPage';
import { allSpacing } from '@theme/tokens';
import AporteConfigCard from '@finanzas/configuracion/components/AporteConfigCard.jsx';
import MetodosPagoCard from '@finanzas/configuracion/components/MetodosPagoCard.jsx';
import BancosCard from '@finanzas/configuracion/components/BancosCard.jsx';
import CuentasCard from '@finanzas/configuracion/components/CuentasCard.jsx';

const ConfigPagosPage = () => {
  const {
    gestionVigente,
    breadcrumbItems,
    aporteVigente,
    metodos,
    bancos,
    cuentas,
    loading,
    error,
    refetch,
    saving,
    // Aporte
    guardarAporte,
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
  } = useConfigPagosPage();

  /** Resuelve el nombre del método por id (para las tablas de bancos/cuentas). */
  const metodoNombrePorId = useMemo(() => {
    const mapa = new Map(metodos.map((metodo) => [metodo.id, metodo.nombre]));
    return (id) => (id != null ? mapa.get(id) ?? null : null);
  }, [metodos]);

  let body;
  if (loading) {
    body = (
      <Flex align="center" justify="center" style={{ minHeight: allSpacing.skeletonCardHeight }}>
        <Spin size="large" tip="Cargando configuración de pagos..." />
      </Flex>
    );
  } else if (error) {
    body = (
      <Alert
        type="error"
        showIcon
        title="No se pudo cargar la configuración de pagos"
        description={error}
        action={
          <Button size="small" onClick={refetch}>
            Reintentar
          </Button>
        }
      />
    );
  } else if (metodos.length === 0 && bancos.length === 0 && cuentas.length === 0 && !aporteVigente) {
    body = <Empty description="No hay datos de configuración de pagos" />;
  } else {
    body = (
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <AporteConfigCard
          aporteVigente={aporteVigente}
          gestionVigente={gestionVigente}
          saving={saving}
          onGuardar={guardarAporte}
        />

        <MetodosPagoCard
          metodos={metodos}
          saving={saving}
          onToggleActivo={toggleMetodoActivo}
          modalAbierto={metodoModalAbierto}
          metodoEnEdicion={metodoEnEdicion}
          onAbrirModal={abrirMetodoModal}
          onCerrarModal={cerrarMetodoModal}
          onGuardar={guardarMetodo}
        />

        <BancosCard
          bancos={bancos}
          metodos={metodos}
          saving={saving}
          metodoNombrePorId={metodoNombrePorId}
          modalAbierto={bancoModalAbierto}
          bancoEnEdicion={bancoEnEdicion}
          onAbrirModal={abrirBancoModal}
          onCerrarModal={cerrarBancoModal}
          onGuardar={guardarBancoSubmit}
          onToggleActivo={toggleBancoActivo}
        />

        <CuentasCard
          cuentas={cuentas}
          metodos={metodos}
          bancos={bancos}
          saving={saving}
          metodoNombrePorId={metodoNombrePorId}
          modalAbierto={cuentaModalAbierto}
          cuentaEnEdicion={cuentaEnEdicion}
          onAbrirModal={abrirCuentaModal}
          onCerrarModal={cerrarCuentaModal}
          onGuardar={guardarCuentaSubmit}
          onToggleActivo={toggleCuentaActiva}
        />
      </Flex>
    );
  }

  return (
    <PageTemplate
      header={<PageHeader title="Config. de pagos" breadcrumbItems={breadcrumbItems} />}
    >
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        {body}
      </Flex>
    </PageTemplate>
  );
};

export default ConfigPagosPage;
