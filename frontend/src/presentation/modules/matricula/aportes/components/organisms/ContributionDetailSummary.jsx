/**
 * ContributionDetailSummary - Componente para mostrar el detalle del aporte académico
 *
 * Single Responsibility: Mostrar un resumen tipo recibo (SOLO LECTURA) del aporte
 * académico: monto base, descuento, cuotas ya pagadas y saldo pendiente.
 *
 * Atomic Design: Organism
 * - Sección PLANA dentro de un panel/workspace: la tarjeta, el título y la
 *   descripción los pone el contenedor en la página — aquí no va ninguna `Card`.
 * - Si estadoActualAporte está presente: muestra saldo real, total pagado y cuotas.
 * - El monto de esta cuota se captura aparte (MontoCuotaInput, paso "Datos del
 *   pago" del wizard); este resumen es de verificación.
 * - Colores desde el theme de AntD (`theme.useToken`), no hex sueltos.
 *
 * @param {Object} configuracionAporte - Configuración de aporte activa
 * @param {Object} becaActiva - Beca activa del estudiante (opcional)
 * @param {Object} estadoActualAporte - Estado actual del aporte (saldo_pendiente, total_pagado, cuotas, tiene_descuento_aplicado, gestion). Si existe, se usa para saldo real y cuotas pagadas.
 * @param {boolean} loading - Estado de carga
 * @param {string} error - Mensaje de error
 */

import { Alert, Divider, Flex, Spin, Table, Tooltip, Typography, theme } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { formatFechaCorta } from '@application/utils';
import { resolveConceptoNombre } from '../../config/aporteConcepto';

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
  const totalPagado = usaEstadoActual ? (Number(estadoActualAporte.total_pagado) || 0) : 0;
  const cuotasPagadas = (usaEstadoActual && Array.isArray(estadoActualAporte.cuotas)) ? estadoActualAporte.cuotas : [];

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

  // Nombre del concepto (gestión) — helper compartido con el paso Confirmación
  const conceptoNombre = resolveConceptoNombre(estadoActualAporte, configuracionAporte);

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
          <Text strong style={{ color: token.colorSuccess }}>- {formatMonto(descuentoMonto)}</Text>
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
            {/* Clase scoped: la tabla se funde con el fondo del panel (solo esta tabla,
                sin tocar el look global de Table) */}
            <Table
              className="pago-cuotas-table"
              size="small"
              pagination={false}
              dataSource={cuotasPagadas.map((c, i) => ({ ...c, key: c.id || i }))}
              columns={[
                { title: 'Recibo', dataIndex: 'numero_recibo', key: 'numero_recibo', width: 100, render: (v) => v || '—' },
                { title: 'Fecha', dataIndex: 'fecha_pago', key: 'fecha_pago', width: 110, render: (v) => formatFechaCorta(v) },
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
    </Flex>
  );
};

export default ContributionDetailSummary;
