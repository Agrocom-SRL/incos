/**
 * PagosDetail - Página para ver el detalle de un pago
 * 
 * Single Responsibility: Mostrar los datos completos del pago recuperados
 * 
 * Atomic Design: Page
 * - Orquesta datos + componentes
 * - Pasa HEADER al Template (estructura)
 * - Muestra los datos del pago en formato de "print"
 * 
 * Arquitectura:
 * Page → Template (header) + Contenido (datos del pago)
 * - Template maneja: estructura/layout (header, content)
 * - Contenido muestra: datos del pago y sus relaciones
 */

import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { usePagosDetailContext } from '@application-pagos/hooks';
import { Descriptions, Card, Spin, Alert, Empty, Tag, Divider, Button } from 'antd';
import { DollarOutlined, UserOutlined, CalendarOutlined, CreditCardOutlined, FileTextOutlined, DownloadOutlined } from '@ant-design/icons';
import { downloadFile } from '@application/utils';

const PagosDetail = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();

  // Obtener datos del contexto
  const {
    pago,
    loading = false,
    error = null,
  } = usePagosDetailContext();

  // Redirigir a la lista solo si hay un error definitivo (no mientras carga)
  useEffect(() => {
    if (!loading && error) {
      navigate('/pagos', { replace: true });
    }
  }, [loading, error, navigate]);

  // Configurar breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { title: 'Inicio', href: '/' },
    { title: 'Pagos', href: '/pagos' },
    { title: 'Detalle del Pago' },
  ], []);

  // Si está cargando
  if (loading) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title="Detalle del Pago"
            breadcrumbItems={breadcrumbItems}
          />
        }
      >
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large">
            <div style={{ minHeight: '200px' }}>
              <p>Cargando datos del pago...</p>
            </div>
          </Spin>
        </div>
      </PageTemplate>
    );
  }

  // Si hay error
  if (error) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title="Detalle del Pago"
            breadcrumbItems={breadcrumbItems}
          />
        }
      >
        <Alert
          message="Error al cargar el pago"
          description={error}
          type="error"
          showIcon
        />
      </PageTemplate>
    );
  }

  // Si no hay pago
  if (!pago || !pago.id) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title="Detalle del Pago"
            breadcrumbItems={breadcrumbItems}
          />
        }
      >
        <Empty description="No se encontró información del pago" />
      </PageTemplate>
    );
  }

  // Función para formatear monto
  const formatMonto = (monto) => {
    if (monto === null || monto === undefined) return '0.00';
    return Number(monto).toFixed(2);
  };

  // Función para formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return fecha;
    }
  };

  // Función para obtener el color del tag según el estado
  const getStatusColor = (status) => {
    const statusColors = {
      'APROBADO': 'success',
      'PENDIENTE': 'warning',
      'RECHAZADO': 'error',
    };
    return statusColors[status] || 'default';
  };

  // Obtener el documento del recibo desde los datos del pago
  const reciboDocumento = pago?.reciboDocumento || null;

  // Función para descargar el recibo de pago
  const handleDownloadRecibo = async () => {
    if (!reciboDocumento) {
      message.warning('El recibo de pago no está disponible');
      return;
    }

    try {
      const filePath = reciboDocumento.filePath;
      const fileName = reciboDocumento.fileName || 'recibo_pago.pdf';
      
      console.log('[PagosDetail] Intentando descargar recibo:', {
        filePath,
        fileName,
      });

      // Verificar que filePath esté presente
      if (!filePath) {
        message.error('La ruta del archivo no está disponible');
        return;
      }

      message.loading({ content: 'Descargando recibo de pago...', key: 'download' });
      await downloadFile(filePath, fileName);
      message.success({ content: 'Recibo de pago descargado exitosamente', key: 'download' });
    } catch (err) {
      console.error('Error al descargar el recibo de pago:', err);
      message.error({ 
        content: 'Error al descargar el recibo de pago: ' + (err.message || 'Error desconocido'),
        key: 'download',
        duration: 5,
      });
    }
  };

  return (
    <PageTemplate
      header={
        <PageHeader
          title={`Detalle del Pago #${pago.receipt_number || pago.numeroRecibo || pago.id}`}
          breadcrumbItems={breadcrumbItems}
        />
      }
    >
      <div style={{ padding: '24px' }}>
        {/* Botón de descarga del recibo */}
        {reciboDocumento ? (
          <Card 
            style={{ marginBottom: '24px', backgroundColor: '#f0f9ff', border: '1px solid #1890ff' }}
            styles={{ body: { padding: '16px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: '#1890ff', fontSize: '16px' }}>
                  📄 Recibo de Pago Disponible
                </h3>
                <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
                  Puede descargar el Recibo de Pago en formato PDF
                </p>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<DownloadOutlined />}
                onClick={handleDownloadRecibo}
              >
                Descargar Recibo de Pago
              </Button>
            </div>
          </Card>
        ) : (
          <Card 
            style={{ marginBottom: '24px', backgroundColor: '#fff7e6', border: '1px solid #faad14' }}
            styles={{ body: { padding: '16px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: '#faad14', fontSize: '16px' }}>
                  📋 Recibo de Pago No Disponible
                </h3>
                <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
                  El recibo de pago no está disponible para descarga en este momento.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Datos del Pago */}
        <Card 
          title={
            <span>
              <DollarOutlined style={{ marginRight: '8px' }} />
              Información del Pago
            </span>
          }
          style={{ marginBottom: '24px' }}
        >
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Número de Recibo">
              <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 'bold' }}>
                {pago.receipt_number || pago.numeroRecibo || pago.id}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Fecha de Pago">
              <span>
                <CalendarOutlined style={{ marginRight: '4px' }} />
                {formatFecha(pago.payment_date || pago.fechaPago)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Concepto" span={2}>
              {pago.concept || pago.concepto || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Monto Total">
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                <DollarOutlined style={{ marginRight: '4px' }} />
                Bs. {formatMonto(pago.total_amount || pago.montoTotal)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Descuento por Beca">
              {pago.scholarship_discount || pago.descuentoBeca ? (
                <span style={{ color: '#52c41a' }}>
                  - Bs. {formatMonto(pago.scholarship_discount || pago.descuentoBeca)}
                </span>
              ) : (
                'Sin descuento'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Monto Pagado">
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                <DollarOutlined style={{ marginRight: '4px' }} />
                Bs. {formatMonto(pago.amount_paid || pago.montoPagado || ((pago.total_amount || pago.montoTotal || 0) - (pago.scholarship_discount || pago.descuentoBeca || 0)))}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Método de Pago">
              {pago.metodoPago ? (
                <span>
                  <CreditCardOutlined style={{ marginRight: '4px' }} />
                  {pago.metodoPago.nombre || pago.metodoPago.codigo || 'N/A'}
                </span>
              ) : (
                'N/A'
              )}
            </Descriptions.Item>
            {pago.transaction_number || pago.numeroTransaccion ? (
              <Descriptions.Item label="Número de Transacción" span={2}>
                <span style={{ fontFamily: 'monospace' }}>
                  {pago.transaction_number || pago.numeroTransaccion}
                </span>
              </Descriptions.Item>
            ) : null}
            {pago.observations ? (
              <Descriptions.Item label="Observaciones" span={2}>
                {pago.observations}
              </Descriptions.Item>
            ) : null}
          </Descriptions>
        </Card>

        <Divider />

        {/* Datos del Estudiante */}
        {pago.estudiante && (
          <Card 
            title={
              <span>
                <UserOutlined style={{ marginRight: '8px' }} />
                Datos del Estudiante
              </span>
            }
            style={{ marginBottom: '24px' }}
          >
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Nombre Completo">
                <strong>{pago.estudiante.nombreCompleto || 'N/A'}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Código de Estudiante">
                {pago.estudiante.codigoEstudiante || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="CI">
                {pago.estudiante.ci ? (
                  `${pago.estudiante.ci} ${pago.estudiante.expedicion ? `(${pago.estudiante.expedicion})` : ''}`
                ) : 'N/A'}
              </Descriptions.Item>
              {pago.estudiante.nombre && (
                <>
                  <Descriptions.Item label="Nombre">
                    {pago.estudiante.nombre}
                  </Descriptions.Item>
                  <Descriptions.Item label="Apellidos">
                    {`${pago.estudiante.apellidoPaterno || ''} ${pago.estudiante.apellidoMaterno || ''}`.trim() || 'N/A'}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </Card>
        )}

        <Divider />

        {/* Datos de la Gestión */}
        {pago.gestion && (
          <Card 
            title={
              <span>
                <CalendarOutlined style={{ marginRight: '8px' }} />
                Gestión Académica
              </span>
            }
            style={{ marginBottom: '24px' }}
          >
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Código">
                {pago.gestion.codigo || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Nombre">
                {pago.gestion.nombre || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Año" span={2}>
                {pago.gestion.anio || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        <Divider />

        {/* Información de Beca */}
        {pago.beca && (
          <Card 
            title={
              <span>
                <FileTextOutlined style={{ marginRight: '8px' }} />
                Información de Beca
              </span>
            }
            style={{ marginBottom: '24px' }}
          >
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Estado de la Beca">
                {pago.beca.estado ? (
                  <Tag color={pago.beca.estado === 'ACTIVA' ? 'success' : 'default'}>
                    {pago.beca.estado}
                  </Tag>
                ) : 'N/A'}
              </Descriptions.Item>
              {pago.beca.fechaSolicitud ? (
                <Descriptions.Item label="Fecha de Solicitud">
                  {formatFecha(pago.beca.fechaSolicitud)}
                </Descriptions.Item>
              ) : (
                <Descriptions.Item label="">-</Descriptions.Item>
              )}
              {pago.beca.tipoBeca && (
                <>
                  <Descriptions.Item label="Tipo de Beca">
                    {pago.beca.tipoBeca.nombre || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Descuento">
                    {pago.beca.tipoBeca.porcentaje ? (
                      <Tag color="green">{pago.beca.tipoBeca.porcentaje}%</Tag>
                    ) : 'N/A'}
                  </Descriptions.Item>
                  {pago.beca.tipoBeca.codigo ? (
                    <Descriptions.Item label="Código" span={2}>
                      {pago.beca.tipoBeca.codigo}
                    </Descriptions.Item>
                  ) : null}
                  {pago.beca.tipoBeca.descripcion && (
                    <Descriptions.Item label="Descripción" span={2}>
                      {pago.beca.tipoBeca.descripcion}
                    </Descriptions.Item>
                  )}
                </>
              )}
            </Descriptions>
          </Card>
        )}

        {/* Información de Inscripción (si existe) */}
        {pago.inscripcion && (
          <>
            <Divider />
            <Card 
              title={
                <span>
                  <FileTextOutlined style={{ marginRight: '8px' }} />
                  Inscripción Relacionada
                </span>
              }
              style={{ marginBottom: '24px' }}
            >
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Código de Inscripción">
                  {pago.inscripcion.codigo || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Fecha de Inscripción">
                  {formatFecha(pago.inscripcion.fechaInscripcion)}
                </Descriptions.Item>
                <Descriptions.Item label="Estado">
                  {pago.inscripcion.estado ? (
                    <Tag color={pago.inscripcion.estado === 'ACTIVA' ? 'success' : 'default'}>
                      {pago.inscripcion.estado}
                    </Tag>
                  ) : 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </>
        )}

        {/* Información Adicional */}
        <Card 
          title="Información Adicional"
          style={{ marginBottom: '24px' }}
        >
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Fecha de Creación">
              {formatFecha(pago.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Última Actualización">
              {formatFecha(pago.updatedAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Estado del Registro">
              {pago.activo !== undefined ? (
                <Tag color={pago.activo ? 'success' : 'default'}>
                  {pago.activo ? 'Activo' : 'Inactivo'}
                </Tag>
              ) : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </PageTemplate>
  );
};

export default PagosDetail;
