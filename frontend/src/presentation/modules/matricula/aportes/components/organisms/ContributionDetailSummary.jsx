/**
 * ContributionDetailSummary - Componente para mostrar el detalle del aporte académico
 *
 * Single Responsibility: Mostrar un resumen tipo recibo del aporte académico con monto base, descuento, total y monto de esta cuota
 *
 * Atomic Design: Organism
 * - Sección PLANA dentro del workspace de formulario (`CfgFormWorkspace`):
 *   la tarjeta, el título y la descripción los pone la sección del workspace
 *   en la página — aquí no va ninguna `Card` anidada.
 * - Resumen tipo recibo: monto base, descuento (si existe), saldo total e input
 *   para el monto de esta cuota (sistema por cuotas).
 * - Si estadoActualAporte está presente: muestra saldo real a pagar, total pagado y lista de cuotas ya pagadas
 * - El monto de esta cuota no se pre-rellena con el saldo: lo controla el padre (p. ej. inicia en 0)
 * - Colores desde el theme de AntD (`theme.useToken`), no hex sueltos.
 *
 * @param {Object} configuracionAporte - Configuración de aporte activa
 * @param {Object} becaActiva - Beca activa del estudiante (opcional)
 * @param {Object} estadoActualAporte - Estado actual del aporte (saldo_pendiente, total_pagado, cuotas, tiene_descuento_aplicado, gestion). Si existe, se usa para saldo real y cuotas pagadas.
 * @param {boolean} loading - Estado de carga
 * @param {string} error - Mensaje de error
 * @param {number|string} montoCuota - Monto que el usuario pagará en esta cuota (controlado)
 * @param {Function} onMontoCuotaChange - Callback cuando cambia el monto de la cuota
 * @param {number} montoObligatorioMax - Saldo total de la deuda (máximo permitido para esta cuota). Se ignora si estadoActualAporte existe; en ese caso se usa estadoActualAporte.saldo_pendiente.
 */

import { useEffect } from 'react';
import { Alert, Col, Divider, Flex, InputNumber, Row, Spin, Table, Tooltip, Typography, theme } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

// Helper para formatear monto (con Bs.)
const formatMonto = (monto) => {
  if (!monto && monto !== 0) return 'N/A';
  return `Bs. ${Number(monto).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const ContributionDetailSummary = ({
  configuracionAporte,
  becaActiva,
  estadoActualAporte = null,
  loading = false,
  error = null,
  montoCuota,
  onMontoCuotaChange,
  montoObligatorioMax = 0 // eslint-disable-line no-unused-vars -- contrato del padre; el saldo real sale de estadoActualAporte
}) => {
  const { token } = theme.useToken();

  // ── Valores derivados (null-safe: se calculan siempre, antes de cualquier
  // return, para que los hooks corran en el mismo orden en cada render) ──
  // Usar estado actual del aporte cuando exista (saldo real, cuotas ya pagadas)
  const usaEstadoActual = !!estadoActualAporte;
  const montoBase = usaEstadoActual
    ? (Number(estadoActualAporte.monto_base) || 0)
    : (Number(configuracionAporte?.montoBase) || 0);
  const descuentoBecaEstado = usaEstadoActual ? (Number(estadoActualAporte.descuento_beca) || 0) : 0;
  const tieneDescuentoAplicado = usaEstadoActual ? !!estadoActualAporte.tiene_descuento_aplicado : false;

  // Verificar si hay beca aplicable (solo cuando no usamos estado actual, o para consistencia visual)
  const tieneBeca = !usaEstadoActual && becaActiva && (() => {
    const stateValue = becaActiva.state || becaActiva.estado;
    if (!stateValue) return false;
    const normalizedState = String(stateValue).toUpperCase();
    const tieneEstadoValido = normalizedState === 'ACTIVA' || normalizedState === 'ACTIVE' || normalizedState === 'PENDIENTE';
    const tienePorcentaje = becaActiva.scholarshipPercentage || becaActiva.porcentaje;
    return tieneEstadoValido && tienePorcentaje;
  })();

  const porcentajeDescuento = tieneBeca ? (becaActiva.scholarshipPercentage || becaActiva.porcentaje || (becaActiva.scholarshipType?.percentage) || 0) : 0;
  const descuentoMonto = usaEstadoActual ? descuentoBecaEstado : (tieneBeca ? (montoBase * porcentajeDescuento / 100) : 0);
  const subtotal = montoBase - descuentoMonto;
  // Saldo real: si hay estado actual, es saldo_pendiente; si no, el calculado (nunca monto base)
  const saldoTotalDeuda = usaEstadoActual ? Number(estadoActualAporte.saldo_pendiente) : subtotal;
  // El input debe usar siempre el saldo a pagar, nunca el monto base. Solo números enteros.
  const saldoAPagar = Math.floor(Number(saldoTotalDeuda) || 0);
  const totalPagado = usaEstadoActual ? (Number(estadoActualAporte.total_pagado) || 0) : 0;
  const cuotasPagadas = (usaEstadoActual && Array.isArray(estadoActualAporte.cuotas)) ? estadoActualAporte.cuotas : [];

  // Sin saldo: normalizar a 0. Con saldo: solo recortar si el valor supera el máximo (no autocompletar con el saldo al cargar)
  // Inerte durante la carga (mismo comportamiento que cuando el componente retornaba antes del hook).
  useEffect(() => {
    if (loading || !onMontoCuotaChange) return;
    if (saldoAPagar <= 0) {
      const actual = montoCuota != null && montoCuota !== '' ? Math.floor(Number(montoCuota)) : 0;
      if (actual !== 0) onMontoCuotaChange(0);
      return;
    }
    const actual = montoCuota != null && montoCuota !== '' ? Math.floor(Number(montoCuota)) : null;
    if (actual != null && actual > saldoAPagar) {
      onMontoCuotaChange(saldoAPagar);
    }
  }, [loading, saldoAPagar, montoCuota, onMontoCuotaChange]);

  // Si está cargando, mostrar indicador compacto
  if (loading) {
    return (
      <Flex align="center" gap="small">
        <Spin size="small" />
        <Text type="secondary">Cargando la configuración del aporte…</Text>
      </Flex>
    );
  }

  // Si hay error, mostrar alerta
  if (error) {
    return (
      <Alert
        title="Error al cargar configuración de aporte"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  // Si no hay configuración ni estado actual, no mostrar nada
  if (!configuracionAporte && !estadoActualAporte) {
    return null;
  }

  // Nombre del concepto (gestión)
  const conceptoNombre = (() => {
    if (usaEstadoActual && estadoActualAporte.gestion) {
      const g = estadoActualAporte.gestion;
      const name = g.nombre ?? g.name ?? g.anio ?? g.year;
      return name ? `Aporte académico - Gestión ${name}` : 'Aporte académico';
    }
    const gestionName = configuracionAporte?.gestionName || configuracionAporte?.gestion?.name || configuracionAporte?.gestion?.year;
    return gestionName ? `Aporte académico - Gestión ${gestionName}` : 'Aporte académico';
  })();

  return (
    <Flex vertical gap="middle">
      {/* Item/Concepto */}
      <Flex justify="space-between" align="center" gap="middle" wrap>
        <Text>{conceptoNombre}</Text>
        <Text strong>{formatMonto(montoBase)}</Text>
      </Flex>

      {/* Descuento por Beca (o ya aplicado en cabecera) */}
      {(tieneBeca || tieneDescuentoAplicado) && (
        <Flex justify="space-between" align="center" gap="middle" wrap>
          <Flex align="center" gap="small">
            <Text style={{ color: token.colorSuccess }}>
              Descuento{tieneDescuentoAplicado && usaEstadoActual ? ' (aplicado)' : ''}
            </Text>
            {tieneBeca && (
              <Tooltip
                title={`Beca activa: ${becaActiva.scholarshipName || becaActiva.scholarshipType?.name || `Beca ${porcentajeDescuento}%`}. El descuento se aplica automáticamente sobre el monto base.`}
              >
                <QuestionCircleOutlined style={{ color: token.colorPrimary, cursor: 'help' }} />
              </Tooltip>
            )}
          </Flex>
          <Text strong>- {formatMonto(descuentoMonto)}</Text>
        </Flex>
      )}

      {/* Subtotal */}
      {(tieneBeca || tieneDescuentoAplicado) && (
        <Flex justify="space-between" align="center" gap="middle" wrap>
          <Text>Subtotal</Text>
          <Text strong>{formatMonto(subtotal)}</Text>
        </Flex>
      )}

      {/* Total pagado y cuotas ya pagadas (solo cuando hay estado actual con pagos) */}
      {cuotasPagadas.length > 0 && (
        <>
          <Flex justify="space-between" align="center" gap="middle" wrap>
            <Text style={{ color: token.colorInfo }}>Total ya pagado</Text>
            <Text strong style={{ color: token.colorInfo }}>{formatMonto(totalPagado)}</Text>
          </Flex>
          <Flex vertical gap="small">
            <Text type="secondary">Cuotas registradas ({cuotasPagadas.length})</Text>
            <Table
              size="small"
              pagination={false}
              dataSource={cuotasPagadas.map((c, i) => ({ ...c, key: c.id || i }))}
              columns={[
                { title: 'Recibo', dataIndex: 'numero_recibo', key: 'numero_recibo', width: 100, render: (v) => v || '—' },
                { title: 'Fecha', dataIndex: 'fecha_pago', key: 'fecha_pago', width: 110, render: (v) => (v ? String(v).slice(0, 10) : '—') },
                { title: 'Monto', dataIndex: 'monto', key: 'monto', align: 'right', render: (v) => formatMonto(v) },
              ]}
            />
          </Flex>
        </>
      )}

      {/* Línea separadora del total */}
      <Divider style={{ margin: 0 }} />

      {/* Saldo a pagar / Saldo total de la deuda */}
      <Flex justify="space-between" align="center" gap="middle" wrap>
        <Text>
          {usaEstadoActual && totalPagado > 0 ? 'Saldo pendiente a pagar' : 'Saldo total de la deuda'}
        </Text>
        <Text strong style={{ fontSize: token.fontSizeHeading5 }}>
          {formatMonto(saldoTotalDeuda)}
        </Text>
      </Flex>

      {/* Monto de esta cuota (solo si hay deuda > 0): usa siempre saldo a pagar, nunca monto base */}
      {saldoAPagar > 0 && (
        <>
          <Row gutter={[16, 8]} align="middle" justify="space-between">
            <Col flex="auto">
              <Text>Monto de esta cuota</Text>
            </Col>
            <Col xs={24} sm={10} md={8} lg={6}>
              <InputNumber
                controls={false}
                size="large"
                value={
                  montoCuota !== null && montoCuota !== undefined && montoCuota !== ''
                    ? Math.floor(Number(montoCuota))
                    : undefined
                }
                onChange={(val) => {
                  // Permitir limpiar el campo sin forzar a 1
                  if (val === null || val === undefined || val === '') {
                    onMontoCuotaChange?.(null);
                    return;
                  }
                  const n = Math.floor(Number(val));
                  if (Number.isNaN(n) || n < 0) {
                    // Para valores inválidos o negativos, resetear a 0 (pago gratuito) sin bloquear
                    onMontoCuotaChange?.(0);
                    return;
                  }
                  const clamped = Math.min(Math.max(n, 0), saldoAPagar);
                  onMontoCuotaChange?.(clamped);
                }}
                min={0}
                max={saldoAPagar}
                step={1}
                prefix="Bs."
                placeholder={String(saldoAPagar).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                style={{ width: '100%' }}
                styles={{ input: { textAlign: 'right' } }}
                formatter={(value) =>
                  value !== null && value !== undefined && value !== ''
                    ? `${Math.floor(Number(value))}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    : ''
                }
                parser={(value) => {
                  if (!value) return null;
                  const cleaned = String(value).replace(/,/g, '').replace(/[^0-9]/g, '');
                  const num = parseInt(cleaned, 10);
                  if (Number.isNaN(num)) return null;
                  return Math.min(Math.max(num, 0), saldoAPagar);
                }}
                precision={0}
              />
            </Col>
          </Row>
          <Text type="secondary">
            Puede pagar en una o varias cuotas. Máximo por cuota (saldo a pagar): {formatMonto(saldoAPagar)}
          </Text>
        </>
      )}
    </Flex>
  );
};

export default ContributionDetailSummary;
