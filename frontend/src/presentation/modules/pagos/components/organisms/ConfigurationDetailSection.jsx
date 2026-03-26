/**
 * ConfigurationDetailSection - Organism para mostrar la configuración de aporte como vista de detalle
 * 
 * Single Responsibility: Mostrar información de la configuración de aporte activa (no seleccionable)
 * 
 * Atomic Design: Organism
 * - Muestra información de la configuración de aporte actual
 * - Incluye información de beca si existe
 * - Calcula y muestra monto base, descuento y saldo total de la configuración (no el monto por cuota; ese se ingresa en registro de pago)
 * 
 * @param {Object} configuracionAporte - Configuración de aporte activa
 * @param {Object} becaActiva - Beca activa del estudiante (opcional)
 * @param {boolean} loading - Estado de carga
 * @param {string} error - Mensaje de error
 */

import { Row, Col, Alert, Spin, Tag } from 'antd';
import { DollarOutlined, InfoCircleOutlined, PercentageOutlined } from '@ant-design/icons';
import { Card } from '@atoms';

// Helper para formatear monto
const formatMonto = (monto) => {
  if (!monto && monto !== 0) return 'N/A';
  return `Bs. ${Number(monto).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const ConfigurationDetailSection = ({
  configuracionAporte,
  becaActiva,
  loading = false,
  error = null
}) => {
  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <Card
        title="Configuración de Aporte"
        style={{ marginTop: '24px', marginBottom: '24px' }}
        headerColor="primary"
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
        title="Configuración de Aporte"
        style={{ marginTop: '24px', marginBottom: '24px' }}
        headerColor="primary"
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
  const tieneBeca = becaActiva && becaActiva.estado === 'ACTIVA';
  const porcentajeDescuento = tieneBeca ? (becaActiva.scholarshipPercentage || 0) : 0;
  const descuentoMonto = tieneBeca ? (montoBase * porcentajeDescuento / 100) : 0;
  const saldoAPagar = montoBase - descuentoMonto;

  return (
    <Card
      title="Configuración de Aporte"
      style={{ marginTop: '24px', marginBottom: '24px' }}
      headerColor="primary"
    >
      {/* Tabla de resumen tipo factura */}
      <div style={{ 
        border: '1px solid var(--color-border-secondary, #e8e8e8)', 
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#fff'
      }}>
        {/* Monto Base (Subtotal) */}
        <div style={{ 
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--color-border-secondary, #e8e8e8)'
        }}>
          <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text, #262626)' }}>
            Monto Base
          </div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text, #262626)' }}>
            {formatMonto(montoBase)}
          </div>
        </div>

        {/* Descuento por Beca */}
        {tieneBeca && (
          <>
            <div style={{ 
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--color-border-secondary, #e8e8e8)',
              backgroundColor: 'var(--color-success-light, #f6ffed)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text, #262626)' }}>
                  Descuento por Beca
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary, #8c8c8c)' }}>
                  {becaActiva.scholarshipName || `Beca ${porcentajeDescuento}%`}
                  {becaActiva.scholarshipPercentage !== undefined && ` (${porcentajeDescuento}% de descuento)`}
                </div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-success, #52c41a)' }}>
                ({formatMonto(descuentoMonto)})
              </div>
            </div>
          </>
        )}

        {/* Línea doble antes del total */}
        <div style={{ 
          borderTop: '2px solid var(--color-border-secondary, #e8e8e8)',
          borderBottom: '1px solid var(--color-border-secondary, #e8e8e8)',
          height: '1px',
          margin: '0'
        }} />

        {/* Saldo a Pagar (Total) */}
        <div style={{ 
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--color-warning-light, #fffbe6)'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text, #262626)' }}>
            Saldo a Pagar
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-warning, #faad14)' }}>
            {formatMonto(saldoAPagar)}
          </div>
        </div>
      </div>

      {/* Información de gestión */}
      {(configuracionAporte.gestionName || configuracionAporte.gestion?.name || configuracionAporte.gestion?.year) && (
        <div style={{ 
          marginTop: '12px',
          padding: '12px 16px',
          backgroundColor: 'var(--color-primary-light, #e6f7ff)',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', color: 'var(--color-text-secondary, #8c8c8c)' }}>
            Gestión: <strong>{configuracionAporte.gestionName || configuracionAporte.gestion?.name || configuracionAporte.gestion?.year}</strong>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--color-bg-container, #fafafa)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <InfoCircleOutlined style={{ fontSize: '20px', color: 'var(--color-primary, #1890ff)', marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
              Información del Aporte
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary, #8c8c8c)', lineHeight: '1.6' }}>
              {configuracionAporte.descripcion || 
                `Este es el monto del aporte académico anual para la gestión ${configuracionAporte.gestionName || configuracionAporte.gestion?.name || configuracionAporte.gestion?.year || 'actual'}. ` +
                (tieneBeca 
                  ? `El estudiante tiene una beca activa del ${porcentajeDescuento}% que se aplica automáticamente.`
                  : 'El estudiante no cuenta con descuentos por beca en esta gestión.')
              }
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ConfigurationDetailSection;
