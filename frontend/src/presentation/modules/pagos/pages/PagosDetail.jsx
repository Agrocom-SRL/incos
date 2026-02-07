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

import { useMemo, useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { usePagosDetailContext, useEstadoAporteRegistro } from '@application-pagos/hooks';
import { Descriptions, Card, Spin, Alert, Empty, Tag, Divider, Button, Table } from 'antd';
import { Button as CustomButton } from '@atoms';
import { DollarOutlined, UserOutlined, CalendarOutlined, CreditCardOutlined, FileTextOutlined, DownloadOutlined, QrcodeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { downloadFile } from '@application/utils';
import { useCasesFactory } from '@container';

const PagosDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();

  // Si venimos de Registrar Pago o del detalle de estudiante, Volver va al estudiante; si no, a la lista de pagos
  const studentIdFromState = location.state?.studentId ?? null;
  const volverALista = !studentIdFromState;

  // Obtener datos del contexto
  const {
    pago,
    loading = false,
    error = null,
  } = usePagosDetailContext();

  // Estado del aporte (cuotas, total pagado, saldo) para el bloque "Detalle del Aporte"
  const studentIdForEstado = pago?.estudiante?.id ?? pago?.student_id ?? null;
  const gestionIdForEstado = pago?.gestion?.id ?? pago?.management_id ?? null;
  const { estadoAporte, loading: loadingEstado } = useEstadoAporteRegistro(studentIdForEstado, gestionIdForEstado);

  const [downloadingCuotaId, setDownloadingCuotaId] = useState(null);

  // Descargar recibo de una cuota. Acepta id de cuota o numero_recibo (el backend resuelve ambos).
  const handleDownloadReciboCuota = useCallback(async (cuotaIdOrNumeroRecibo) => {
    try {
      if (cuotaIdOrNumeroRecibo == null || cuotaIdOrNumeroRecibo === '') {
        message.error('ID o número de recibo no disponible');
        return;
      }
      setDownloadingCuotaId(cuotaIdOrNumeroRecibo);
      message.loading({ content: 'Generando recibo de la cuota...', key: 'download-cuota' });
      const useCase = useCasesFactory.generarReciboPago();
      if (!useCase) {
        message.error({ content: 'No se pudo inicializar el caso de uso', key: 'download-cuota', duration: 5 });
        return;
      }
      const result = await useCase.ejecutar(cuotaIdOrNumeroRecibo);
      if (!result || !result.success) {
        message.error({ content: result?.error || result?.message || 'Error al generar el recibo', key: 'download-cuota', duration: 5 });
        return;
      }
      const reciboData = result.data;
      if (!reciboData?.filePath) {
        message.error({ content: 'No se pudo obtener el recibo', key: 'download-cuota', duration: 5 });
        return;
      }
      await downloadFile(reciboData.filePath, reciboData.fileName || 'recibo_cuota.pdf');
      message.success({ content: 'Recibo descargado', key: 'download-cuota' });
    } catch (err) {
      message.error({ content: 'Error al descargar recibo: ' + (err?.message || ''), key: 'download-cuota', duration: 5 });
    } finally {
      setDownloadingCuotaId(null);
    }
  }, [message]);

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
          title="Error al cargar el pago"
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

  const handleBack = () => {
    if (volverALista) {
      navigate('/pagos');
    } else {
      navigate(`/estudiantes/${studentIdFromState}`);
    }
  };

  return (
    <PageTemplate
      header={
        <PageHeader
          title={`Detalle del Pago #${pago.receipt_number || pago.numeroRecibo || pago.id}`}
          breadcrumbItems={breadcrumbItems}
          actions={
            <CustomButton
              variant="default"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
            >
              Volver
            </CustomButton>
          }
        />
      }
    >
      <div style={{ padding: '24px' }}>
        {/* Un solo cuadro: Estudiante + Gestión + Datos del aporte (cabecera, tabla pago_aporte) */}
        <Card
          title={
            <span style={{ fontSize: '18px', fontWeight: 600 }}>
              <UserOutlined style={{ marginRight: '8px' }} />
              Resumen del Aporte
            </span>
          }
          style={{ marginBottom: '24px', borderRadius: '8px' }}
          styles={{ body: { padding: '24px 28px' } }}
        >
          {/* Fila 1: 3 columnas — Estudiante | Gestión | Datos del Aporte */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(200px, 1fr))', gap: '24px', marginBottom: pago.beca ? '24px' : 0 }}>
            {pago.estudiante && (
              <div style={{ padding: '18px 20px', background: '#f6ffed', borderRadius: '8px', border: '1px solid #b7eb8f' }}>
                <div style={{ fontSize: '18px', color: '#52c41a', fontWeight: 700, marginBottom: '12px' }}>Estudiante</div>
                <div style={{ fontSize: '18px', lineHeight: 1.8 }}>
                  <div><strong>Código:</strong> {pago.estudiante.codigoEstudiante || 'N/A'}</div>
                  <div><strong>Nombre:</strong> {pago.estudiante.nombreCompleto || 'N/A'}</div>
                  <div><strong>CI:</strong> {pago.estudiante.ci ? `${pago.estudiante.ci} ${(pago.estudiante.expedicion || '').toString().toUpperCase()}`.trim() : 'N/A'}</div>
                </div>
              </div>
            )}
            {pago.gestion && (
              <div style={{ padding: '18px 20px', background: '#e6f7ff', borderRadius: '8px', border: '1px solid #91d5ff' }}>
                <div style={{ fontSize: '18px', color: '#1890ff', fontWeight: 700, marginBottom: '12px' }}>Gestión Académica</div>
                <div style={{ fontSize: '18px', lineHeight: 1.8 }}>
                  <div><strong>Código:</strong> {pago.gestion.codigo || 'N/A'}</div>
                  <div><strong>Nombre:</strong> {pago.gestion.nombre || 'N/A'}</div>
                  <div><strong>Año:</strong> {pago.gestion.anio || 'N/A'}</div>
                </div>
              </div>
            )}
            <div style={{ padding: '18px 20px', background: '#fffbe6', borderRadius: '8px', border: '1px solid #ffe58f' }}>
              <div style={{ fontSize: '18px', color: '#faad14', fontWeight: 700, marginBottom: '12px' }}>Datos del Aporte</div>
              <div style={{ fontSize: '18px', lineHeight: 1.8 }}>
                <div><strong>Monto base:</strong> Bs. {formatMonto(pago.monto_base ?? pago.baseAmount ?? pago.montoBase ?? 0)}</div>
                <div><strong>Descuento beca:</strong> {pago.descuento_beca ?? pago.scholarship_discount ?? pago.descuentoBeca ? `Bs. ${formatMonto(pago.descuento_beca ?? pago.scholarship_discount ?? pago.descuentoBeca)}` : 'Sin descuento'}</div>
                <div><strong>Monto obligatorio:</strong> Bs. {formatMonto(pago.monto_obligatorio ?? pago.mandatoryAmount ?? pago.montoObligatorio ?? 0)}</div>
                <div><strong>Estado:</strong> {(pago.estado ?? pago.state) ? <Tag color={pago.estado === 'CANCELADO' || pago.state === 'CANCELADO' ? 'success' : pago.estado === 'PARCIAL' || pago.state === 'PARCIAL' ? 'processing' : 'default'}>{pago.estado ?? pago.state}</Tag> : 'N/A'}</div>
              </div>
            </div>
          </div>
          {/* Fila 2: 1 columna ancha — Información de Beca */}
          {pago.beca && (
            <div style={{ padding: '18px 20px', background: '#f9f0ff', borderRadius: '8px', border: '1px solid #d3adf7' }}>
              <div style={{ fontSize: '18px', color: '#722ed1', fontWeight: 700, marginBottom: '12px' }}>Información de Beca</div>
              <div style={{ fontSize: '18px', lineHeight: 1.8 }}>
                <div><strong>Estado:</strong> {pago.beca.estado ? <Tag color={pago.beca.estado === 'ACTIVA' ? 'success' : 'default'}>{pago.beca.estado}</Tag> : 'N/A'}</div>
                <div><strong>Fecha de solicitud:</strong> {pago.beca.fechaSolicitud ? formatFecha(pago.beca.fechaSolicitud) : 'N/A'}</div>
                {pago.beca.tipoBeca && (
                  <>
                    <div><strong>Tipo de beca:</strong> {pago.beca.tipoBeca.nombre || 'N/A'}</div>
                    <div><strong>Descuento:</strong> {pago.beca.tipoBeca.porcentaje != null ? <Tag color="green">{pago.beca.tipoBeca.porcentaje}%</Tag> : 'N/A'}</div>
                    {pago.beca.tipoBeca.codigo ? <div><strong>Código:</strong> {pago.beca.tipoBeca.codigo}</div> : null}
                    {pago.beca.tipoBeca.descripcion ? <div style={{ marginTop: '8px' }}><strong>Descripción:</strong> {pago.beca.tipoBeca.descripcion}</div> : null}
                  </>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Detalle del Aporte (estado: cuotas, total pagado, saldo), diseño similar a imagen */}
        <Card
          title={
            <span>
              <DollarOutlined style={{ marginRight: '8px' }} />
              Detalle del Aporte
            </span>
          }
          style={{ marginBottom: '24px' }}
        >
          {loadingEstado ? (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <Spin tip="Cargando detalle del aporte..." />
            </div>
          ) : estadoAporte ? (
            <>
              <div style={{ marginBottom: '18px' }}>
                <strong>Concepto:</strong>{' '}
                {estadoAporte.gestion
                  ? `Aporte Académico - Gestión ${estadoAporte.gestion.nombre || ''} ${estadoAporte.gestion.anio || ''}`.trim()
                  : 'Aporte Académico'}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Monto Base / Obligatorio:</strong>{' '}
                Bs. {Number(estadoAporte.monto_base ?? estadoAporte.monto_obligatorio ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ marginBottom: '18px', color: '#1890ff' }}>
                <strong>Total ya pagado:</strong>{' '}
                Bs. {Number(estadoAporte.total_pagado ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {estadoAporte.cuotas && estadoAporte.cuotas.length > 0 ? (
                <>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Cuotas registradas ({estadoAporte.cuotas.length}):</strong>
                  </div>
                  <Table
                    dataSource={estadoAporte.cuotas}
                    rowKey={(r) => r.id ?? r.numero_recibo}
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: 'Recibo',
                        dataIndex: 'numero_recibo',
                        key: 'numero_recibo',
                        render: (v) => v || '—',
                      },
                      {
                        title: 'Fecha',
                        dataIndex: 'fecha_pago',
                        key: 'fecha_pago',
                        render: (v) => formatFecha(v),
                      },
                      {
                        title: 'Monto',
                        dataIndex: 'monto',
                        key: 'monto',
                        render: (v) =>
                          `Bs. ${Number(v ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                      },
                      {
                        title: '',
                        key: 'descargar',
                        width: 120,
                        render: (_, record) => (
                          <Button
                            type="link"
                            size="small"
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownloadReciboCuota(record.id ?? record.numero_recibo)}
                            loading={downloadingCuotaId === (record.id ?? record.numero_recibo)}
                          >
                            Descargar recibo
                          </Button>
                        ),
                      },
                    ]}
                  />
                </>
              ) : null}
              <div style={{ marginTop: '18px', fontWeight: 'bold' }}>
                <strong>Saldo pendiente a pagar:</strong>{' '}
                Bs. {Number(estadoAporte.saldo_pendiente ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </>
          ) : (
            <div style={{ color: '#888' }}>
              No hay estado de aporte disponible para esta gestión.
            </div>
          )}
        </Card>

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

      </div>
    </PageTemplate>
  );
};

export default PagosDetail;
