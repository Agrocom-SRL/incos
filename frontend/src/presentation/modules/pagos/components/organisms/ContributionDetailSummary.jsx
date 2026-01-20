/**
 * ContributionDetailSummary - Componente para mostrar el detalle del aporte académico
 * 
 * Single Responsibility: Mostrar un resumen tipo recibo del aporte académico con monto base, descuento y total
 * 
 * Atomic Design: Organism
 * - Diseño minimalista tipo "Detalle de tu compra" similar a Mercado Pago
 * - Muestra monto base, descuento (si existe) y saldo a pagar
 * 
 * @param {Object} configuracionAporte - Configuración de aporte activa
 * @param {Object} becaActiva - Beca activa del estudiante (opcional)
 * @param {boolean} loading - Estado de carga
 * @param {string} error - Mensaje de error
 */

import { Alert, Spin, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Card } from '@atoms';

// Helper para formatear monto
const formatMonto = (monto) => {
  if (!monto && monto !== 0) return 'N/A';
  return `Bs. ${Number(monto).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const ContributionDetailSummary = ({
  configuracionAporte,
  becaActiva,
  loading = false,
  error = null
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
  const saldoAPagar = subtotal;

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

      {/* Saldo a Pagar */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '16px', color: '#262626' }}>
          Saldo a Pagar
        </div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#262626' }}>
          {formatMonto(saldoAPagar)}
        </div>
      </div>
    </Card>
  );
};

export default ContributionDetailSummary;
