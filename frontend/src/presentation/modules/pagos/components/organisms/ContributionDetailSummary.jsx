/**
 * ContributionDetailSummary - Componente para mostrar el detalle del aporte académico
 *
 * Single Responsibility: Mostrar un resumen tipo recibo del aporte académico con monto base, descuento, total y monto de esta cuota
 *
 * Atomic Design: Organism
 * - Diseño minimalista tipo "Detalle de tu compra" similar a Mercado Pago
 * - Muestra monto base, descuento (si existe), saldo total y input para monto de esta cuota (sistema por cuotas)
 * - Si estadoActualAporte está presente: muestra saldo real a pagar, total pagado y lista de cuotas ya pagadas
 * - El monto de esta cuota no se pre-rellena con el saldo: lo controla el padre (p. ej. inicia en 0)
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
import { Alert, Spin, Tooltip, InputNumber, Table } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Card } from '@atoms';

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
  montoObligatorioMax = 0
}) => {
  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <Card
        style={{ marginTop: '24px', marginBottom: '24px' }}
      >
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large">
            <div style={{ minHeight: '100px' }}>
              <p>Cargando configuración de aporte...</p>
            </div>
          </Spin>
        </div>
      </Card>
    );
  }

  // Si hay error, mostrar alerta
  if (error) {
    return (
      <Card
        style={{ marginTop: '24px', marginBottom: '24px' }}
      >
        <Alert
          title="Error al cargar configuración de aporte"
          description={error}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  // Si no hay configuración ni estado actual, no mostrar nada
  if (!configuracionAporte && !estadoActualAporte) {
    return null;
  }

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
  const saldoTotalDeuda = usaEstadoActual ? (Number(estadoActualAporte.saldo_pendiente) ?? subtotal) : subtotal;
  // El input debe usar siempre el saldo a pagar, nunca el monto base. Solo números enteros.
  const saldoAPagar = Math.floor(Number(saldoTotalDeuda) || 0);
  const totalPagado = usaEstadoActual ? (Number(estadoActualAporte.total_pagado) || 0) : 0;
  const cuotasPagadas = (usaEstadoActual && Array.isArray(estadoActualAporte.cuotas)) ? estadoActualAporte.cuotas : [];

  // Sin saldo: normalizar a 0. Con saldo: solo recortar si el valor supera el máximo (no autocompletar con el saldo al cargar)
  useEffect(() => {
    if (!onMontoCuotaChange) return;
    if (saldoAPagar <= 0) {
      const actual = montoCuota != null && montoCuota !== '' ? Math.floor(Number(montoCuota)) : 0;
      if (actual !== 0) onMontoCuotaChange(0);
      return;
    }
    const actual = montoCuota != null && montoCuota !== '' ? Math.floor(Number(montoCuota)) : null;
    if (actual != null && actual > saldoAPagar) {
      onMontoCuotaChange(saldoAPagar);
    }
  }, [saldoAPagar, montoCuota, onMontoCuotaChange]);

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
    <Card
      style={{ 
        marginTop: '24px', 
        marginBottom: '24px',
        padding: '0'
      }}
      styles={{ body: { padding: '24px' } }}
    >
      {/* Título */}
      <div style={{ 
        fontSize: '18px', 
        fontWeight: 'bold', 
        color: '#262626',
        marginBottom: '24px'
      }}>
        Detalle del aporte
      </div>

      {/* Item/Concepto */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div style={{ fontSize: '16px', color: '#262626' }}>
          {conceptoNombre}
        </div>
        <div style={{ fontSize: '16px', fontWeight: '500', color: '#262626' }}>
          {formatMonto(montoBase)}
        </div>
      </div>

      {/* Descuento por Beca (o ya aplicado en cabecera) */}
      {(tieneBeca || tieneDescuentoAplicado) && (
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '16px', color: '#52c41a' }}>
              Descuento{tieneDescuentoAplicado && usaEstadoActual ? ' (aplicado)' : ''}
            </div>
            {tieneBeca && (
              <Tooltip 
                title={`Beca activa: ${becaActiva.scholarshipName || becaActiva.scholarshipType?.name || `Beca ${porcentajeDescuento}%`}. El descuento se aplica automáticamente sobre el monto base.`}
              >
                <QuestionCircleOutlined style={{ fontSize: '14px', color: '#1890ff', cursor: 'help' }} />
              </Tooltip>
            )}
          </div>
          <div style={{ fontSize: '16px', fontWeight: '500', color: '#262626' }}>
            - {formatMonto(descuentoMonto)}
          </div>
        </div>
      )}

      {/* Subtotal */}
      {(tieneBeca || tieneDescuentoAplicado) && (
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '16px', color: '#262626' }}>
            Subtotal
          </div>
          <div style={{ fontSize: '16px', fontWeight: '500', color: '#262626' }}>
            {formatMonto(subtotal)}
          </div>
        </div>
      )}

      {/* Total pagado y cuotas ya pagadas (solo cuando hay estado actual con pagos) */}
      {cuotasPagadas.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '15px', color: '#1890ff' }}>Total ya pagado</div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#1890ff' }}>{formatMonto(totalPagado)}</div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', color: '#595959', marginBottom: '6px' }}>Cuotas registradas ({cuotasPagadas.length})</div>
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
          </div>
        </>
      )}

      {/* Línea separadora */}
      <div style={{ 
        borderTop: '1px solid #e8e8e8',
        margin: '16px 0'
      }} />

      {/* Saldo a pagar / Saldo total de la deuda */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: saldoTotalDeuda > 0 ? '16px' : 0
      }}>
        <div style={{ fontSize: '16px', color: '#262626' }}>
          {usaEstadoActual && totalPagado > 0 ? 'Saldo pendiente a pagar' : 'Saldo total de la deuda'}
        </div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#262626' }}>
          {formatMonto(saldoTotalDeuda)}
        </div>
      </div>

      {/* Monto de esta cuota (solo si hay deuda > 0): usa siempre saldo a pagar, nunca monto base */}
      {saldoAPagar > 0 && (
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          gap: '16px'
        }}>
          <div style={{ fontSize: '16px', color: '#262626', flexShrink: 0 }}>
            Monto de esta cuota
          </div>
          <div style={{ 
            flex: '1', 
            maxWidth: '220px', 
            display: 'flex', 
            justifyContent: 'flex-end' 
          }}>
            <InputNumber
              controls={false}
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
              style={{ 
                width: '100%', 
                borderRadius: '8px',
                fontSize: '22px',
                fontWeight: 600
              }}
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
          </div>
        </div>
      )}
      {saldoAPagar > 0 && (
        <div style={{ fontSize: '12px', color: '#ff4d4f', fontWeight: 500, marginTop: '8px' }}>
          Puede pagar en una o varias cuotas. Máximo por cuota (saldo a pagar): {formatMonto(saldoAPagar)}
        </div>
      )}
    </Card>
  );
};

export default ContributionDetailSummary;
