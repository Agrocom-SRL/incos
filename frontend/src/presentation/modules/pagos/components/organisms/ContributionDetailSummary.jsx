/**
 * ContributionDetailSummary - Componente para mostrar el detalle del aporte académico
 *
 * Single Responsibility: Mostrar un resumen tipo recibo del aporte académico con monto base, descuento, total y monto de esta cuota
 *
 * Atomic Design: Organism
 * - Diseño minimalista tipo "Detalle de tu compra" similar a Mercado Pago
 * - Muestra monto base, descuento (si existe), saldo total y input para monto de esta cuota (sistema por cuotas)
 *
 * @param {Object} configuracionAporte - Configuración de aporte activa
 * @param {Object} becaActiva - Beca activa del estudiante (opcional)
 * @param {boolean} loading - Estado de carga
 * @param {string} error - Mensaje de error
 * @param {number|string} montoCuota - Monto que el usuario pagará en esta cuota (controlado)
 * @param {Function} onMontoCuotaChange - Callback cuando cambia el monto de la cuota
 * @param {number} montoObligatorioMax - Saldo total de la deuda (máximo permitido para esta cuota)
 */

import { Alert, Spin, Tooltip, InputNumber } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Card } from '@atoms';

// Helper para formatear monto (con Bs.)
const formatMonto = (monto) => {
  if (!monto && monto !== 0) return 'N/A';
  return `Bs. ${Number(monto).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Solo número sin "Bs." para placeholder (el input ya tiene prefix="Bs.")
const placeholderMonto = (monto) => {
  if (monto == null || (monto !== 0 && !monto)) return '';
  return Number(monto).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const ContributionDetailSummary = ({
  configuracionAporte,
  becaActiva,
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

  // Si no hay configuración, no mostrar nada
  if (!configuracionAporte) {
    return null;
  }

  // Calcular valores
  const montoBase = Number(configuracionAporte.montoBase) || 0;
  
  // Verificar si hay beca aplicable (ACTIVA o PENDIENTE con porcentaje)
  // Para mostrar el descuento, aceptamos becas ACTIVA o PENDIENTE que tengan porcentaje
  const tieneBeca = becaActiva && (() => {
    const stateValue = becaActiva.state || becaActiva.estado;
    if (!stateValue) return false;
    
    const normalizedState = String(stateValue).toUpperCase();
    const tieneEstadoValido = normalizedState === 'ACTIVA' || normalizedState === 'ACTIVE' || normalizedState === 'PENDIENTE';
    const tienePorcentaje = becaActiva.scholarshipPercentage || becaActiva.porcentaje;
    
    return tieneEstadoValido && tienePorcentaje;
  })();
  
  // Obtener porcentaje de descuento (puede venir de diferentes campos)
  const porcentajeDescuento = tieneBeca ? (
    becaActiva.scholarshipPercentage || 
    becaActiva.porcentaje || 
    (becaActiva.scholarshipType?.percentage) ||
    0
  ) : 0;
  
  const descuentoMonto = tieneBeca ? (montoBase * porcentajeDescuento / 100) : 0;
  const subtotal = montoBase - descuentoMonto;
  const saldoTotalDeuda = subtotal;
  const maxCuota = Number(montoObligatorioMax) || saldoTotalDeuda;

  // Obtener nombre del concepto
  const conceptoNombre = (() => {
    const gestionName = configuracionAporte.gestionName || configuracionAporte.gestion?.name || configuracionAporte.gestion?.year;
    return gestionName 
      ? `Aporte Académico - Gestión ${gestionName}`
      : 'Aporte Académico';
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
        Detalle del Aporte
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

      {/* Descuento por Beca */}
      {tieneBeca && (
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '16px', color: '#52c41a' }}>
              Descuento
            </div>
            <Tooltip 
              title={`Beca activa: ${becaActiva.scholarshipName || becaActiva.scholarshipType?.name || `Beca ${porcentajeDescuento}%`}. El descuento se aplica automáticamente sobre el monto base.`}
            >
              <QuestionCircleOutlined 
                style={{ 
                  fontSize: '14px', 
                  color: '#1890ff',
                  cursor: 'help'
                }} 
              />
            </Tooltip>
          </div>
          <div style={{ fontSize: '16px', fontWeight: '500', color: '#262626' }}>
            - {formatMonto(descuentoMonto)}
          </div>
        </div>
      )}

      {/* Subtotal */}
      {tieneBeca && (
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

      {/* Línea separadora */}
      <div style={{ 
        borderTop: '1px solid #e8e8e8',
        margin: '16px 0'
      }} />

      {/* Saldo total de la deuda */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: saldoTotalDeuda > 0 ? '16px' : 0
      }}>
        <div style={{ fontSize: '16px', color: '#262626' }}>
          Saldo total de la deuda
        </div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#262626' }}>
          {formatMonto(saldoTotalDeuda)}
        </div>
      </div>

      {/* Monto de esta cuota (solo si hay deuda > 0) - misma fila 2 columnas que el resto */}
      {saldoTotalDeuda > 0 && (
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
              value={montoCuota != null ? Number(montoCuota) : undefined}
              onChange={(val) => {
                if (val == null) {
                  onMontoCuotaChange?.(null);
                  return;
                }
                const n = Number(val);
                if (Number.isNaN(n) || n < 0) {
                  onMontoCuotaChange?.(0.01);
                  return;
                }
                const clamped = Math.min(Math.max(n, 0.01), maxCuota);
                onMontoCuotaChange?.(clamped);
              }}
              min={0.01}
              max={maxCuota}
              step={0.01}
              prefix="Bs."
              placeholder={placeholderMonto(maxCuota)}
              style={{ 
                width: '100%', 
                borderRadius: '8px',
                fontSize: '22px',
                fontWeight: 600
              }}
              styles={{ input: { textAlign: 'right' } }}
              formatter={(value) => value != null ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
              parser={(value) => {
                if (!value) return '';
                const cleaned = String(value).replace(/,/g, '').replace(/[^0-9.]/g, '');
                const num = parseFloat(cleaned);
                if (Number.isNaN(num)) return '';
                return Math.min(Math.max(num, 0.01), maxCuota);
              }}
              decimalSeparator="."
              precision={2}
            />
          </div>
        </div>
      )}
      {saldoTotalDeuda > 0 && (
        <div style={{ fontSize: '12px', color: '#ff4d4f', fontWeight: 500, marginTop: '8px' }}>
          Puede pagar en una o varias cuotas. Máximo por cuota: {formatMonto(maxCuota)}
        </div>
      )}
    </Card>
  );
};

export default ContributionDetailSummary;
