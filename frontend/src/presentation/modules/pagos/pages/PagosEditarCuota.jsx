import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App, Alert, Form, InputNumber, Radio, Space, Spin, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button, Card } from '@atoms';
import { useAuthContext } from '@application-auth';
import { useCasesFactory } from '@container';
import { downloadFile } from '@application/utils';
import { useEstadoAporteRegistro, usePagosDetailContext } from '@application-pagos/hooks';
import { StudentInfoSection } from '@estudiantes/components/organisms';
import {
  PaymentMethodSelectionSection,
} from '../components/organisms';
import { PaymentFormFields } from '../components/molecules';

const { Text } = Typography;

const money = (n) =>
  `Bs. ${Number(n ?? 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/** Montos en Bs. con 2 decimales (alineado al backend y al recibo). */
const roundBs = (n) => {
  const x = Number(n);
  if (Number.isNaN(x)) return 0;
  return Math.round(x * 100) / 100;
};

const sumOtros = (cuotas, cuotaId) =>
  roundBs(
    (cuotas || [])
      .filter((c) => c.id !== cuotaId)
      .reduce((acc, c) => acc + Number(c.monto ?? 0), 0)
  );

const buildStudent = (pago) => {
  const est = pago?.estudiante;
  if (!est) return null;
  const ciBase = est.ci ?? est.numeroDocumento ?? '';
  const exp = est.expedicion ? String(est.expedicion).toUpperCase() : '';
  return {
    codigoEstudiante: est.codigoEstudiante || est.code || '—',
    nombreCompleto: est.nombreCompleto || est.fullName || '—',
    ciCompleto: [ciBase, exp].filter(Boolean).join(' ') || ciBase || '—',
  };
};

const PagosEditarCuota = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const { hasPermiso } = useAuthContext();

  const pagoId = id ? parseInt(id, 10) : null;
  const returnListPath = location.state?.returnListPath || '/pagos/listar';
  const menuSidebarKeyFromState = location.state?.menuSidebarKey;
  const selectedCuotaIdFromState = location.state?.selectedCuotaId;

  const puedeEditarCuota =
    hasPermiso('finanzas.pago.editar', 'EDITAR') ||
    hasPermiso('matricula.pago.aporte.ver', 'EDITAR');

  const {
    pago,
    loading: loadingPago,
    error: errorPago,
    refetch: refetchPago,
  } = usePagosDetailContext();

  const studentIdForEstado = pago?.estudiante?.id ?? pago?.student_id ?? null;
  const gestionIdForEstado = pago?.gestion?.id ?? pago?.management_id ?? null;

  const {
    estadoAporte,
    loading: loadingEstado,
    error: errorEstado,
    refetch: refetchEstado,
  } = useEstadoAporteRegistro(studentIdForEstado, gestionIdForEstado);

  const [selectedCuotaId, setSelectedCuotaId] = useState(
    selectedCuotaIdFromState != null ? Number(selectedCuotaIdFromState) : null
  );
  const [montoCuota, setMontoCuota] = useState(0);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const [metodosPago, setMetodosPago] = useState([]);
  const [cuentasPago, setCuentasPago] = useState([]);
  const [bancosAutorizados, setBancosAutorizados] = useState([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

  const cuotas = useMemo(() => {
    const c = estadoAporte?.cuotas;
    return Array.isArray(c) ? c : [];
  }, [estadoAporte?.cuotas]);

  const hayVariasCuotas = cuotas.length > 1;

  useEffect(() => {
    if (!puedeEditarCuota && !loadingPago && pago) {
      message.error('No tiene permiso para editar cuotas de aporte');
      navigate(returnListPath, { replace: true });
    }
  }, [puedeEditarCuota, loadingPago, pago, message, navigate, returnListPath]);

  useEffect(() => {
    if (!cuotas.length) {
      setSelectedCuotaId(null);
      return;
    }
    if (cuotas.length === 1) {
      setSelectedCuotaId(cuotas[0].id);
      return;
    }
    setSelectedCuotaId((prev) => {
      const preferred = prev ?? (selectedCuotaIdFromState != null ? Number(selectedCuotaIdFromState) : null);
      return preferred && cuotas.some((c) => c.id === preferred) ? preferred : null;
    });
  }, [cuotas, selectedCuotaIdFromState]);

  const selectedCuota = useMemo(
    () => cuotas.find((c) => c.id === selectedCuotaId) || null,
    [cuotas, selectedCuotaId]
  );

  const montoObligatorio = useMemo(() => {
    const fromPago = Number(
      pago?.monto_obligatorio ?? pago?.mandatoryAmount ?? pago?.montoObligatorio ?? NaN
    );
    if (!Number.isNaN(fromPago) && fromPago > 0) return roundBs(fromPago);
    return roundBs(Number(estadoAporte?.monto_obligatorio ?? estadoAporte?.monto_base ?? 0));
  }, [pago, estadoAporte]);

  const descuentoDetalle = useMemo(
    () =>
      roundBs(
        Number(
          pago?.descuento_beca ??
            pago?.scholarship_discount ??
            pago?.descuentoBeca ??
            estadoAporte?.descuento_beca ??
            0
        )
      ),
    [pago, estadoAporte]
  );

  const montoBaseDetalle = useMemo(() => {
    const fromPago = Number(pago?.monto_base ?? pago?.baseAmount ?? pago?.montoBase ?? NaN);
    if (!Number.isNaN(fromPago) && fromPago > 0) return roundBs(fromPago);
    const fromEst = Number(estadoAporte?.monto_base ?? NaN);
    if (!Number.isNaN(fromEst) && fromEst > 0) return roundBs(fromEst);
    if (descuentoDetalle > 0) return roundBs(montoObligatorio + descuentoDetalle);
    return roundBs(montoObligatorio);
  }, [pago, estadoAporte, montoObligatorio, descuentoDetalle]);

  const totalOtros = useMemo(() => {
    if (!selectedCuota?.id) return 0;
    return sumOtros(cuotas, selectedCuota.id);
  }, [cuotas, selectedCuota]);

  /** Máximo que puede llevar esta cuota: obligatorio − suma de las demás (no puede “comerse” el total a pagar). */
  const montoMaximoCuota = useMemo(() => {
    if (!selectedCuota?.id) return 0;
    return roundBs(Math.max(0, montoObligatorio - totalOtros));
  }, [selectedCuota, montoObligatorio, totalOtros]);

  const montoCuotaNum = roundBs(Number(montoCuota));
  const montoExcedeMaximo = selectedCuota != null && montoCuotaNum > montoMaximoCuota + 0.0001;

  const [selectedMetodoPago, setSelectedMetodoPago] = useState(null);

  const paymentMethodId = Form.useWatch('metodoPagoId', form);
  const requiresAccount = paymentMethodId === 3 || paymentMethodId === 4;

  const loadCatalogos = useCallback(async () => {
    setLoadingCatalogos(true);
    try {
      const ucMet = useCasesFactory.listarMetodosPago();
      const ucCue = useCasesFactory.listarCuentasPago();
      const ucBan = useCasesFactory.listarBancosAutorizados();

      const [rMet, rCue, rBan] = await Promise.all([
        ucMet.ejecutar({ params: { pagina: 1, limite: 100 } }),
        ucCue.ejecutar({ params: { pagina: 1, limite: 500 } }),
        ucBan.ejecutar({ params: { pagina: 1, limite: 500 } }),
      ]);

      if (rMet?.success && Array.isArray(rMet.data)) setMetodosPago(rMet.data);
      if (rCue?.success && Array.isArray(rCue.data)) setCuentasPago(rCue.data);
      if (rBan?.success && Array.isArray(rBan.data)) setBancosAutorizados(rBan.data);
    } catch {
      message.error('No se pudieron cargar catálogos de pago');
    } finally {
      setLoadingCatalogos(false);
    }
  }, [message]);

  useEffect(() => {
    loadCatalogos();
  }, [loadCatalogos]);

  useEffect(() => {
    if (!selectedCuota) return;

    const currentMonto = roundBs(Number(selectedCuota.monto ?? 0));
    const max = montoMaximoCuota;
    const clamped = roundBs(Math.min(Math.max(0, currentMonto), max));
    setMontoCuota(clamped);

    const methodId = Number(selectedCuota.metodo_pago_id);
    const method = metodosPago.find((m) => Number(m.id) === methodId) || null;
    setSelectedMetodoPago(method);

    const accountId = selectedCuota.cuenta_pago_id ?? null;

    form.setFieldsValue({
      metodoPagoId: methodId || undefined,
      fechaPago: selectedCuota.fecha_pago ? dayjs(selectedCuota.fecha_pago) : undefined,
      cuentaPagoId: accountId ?? undefined,
      numeroTransaccion: selectedCuota.numero_transaccion || '',
      codigoComprobante: selectedCuota.codigo_comprobante || '',
      descripcion: selectedCuota.observacion || '',
      documentoRespaldo: undefined,
    });
  }, [selectedCuota, form, metodosPago, cuentasPago, montoMaximoCuota]);

  useEffect(() => {
    if (!requiresAccount) {
      form.setFieldValue('cuentaPagoId', undefined);
    }
  }, [requiresAccount, form]);

  const handleSelectMetodoPago = useCallback(
    (metodo) => {
      setSelectedMetodoPago(metodo || null);
      const methodId = Number(metodo?.id);
      if (methodId !== 3 && methodId !== 4) {
        form.setFieldValue('cuentaPagoId', undefined);
      }
    },
    [form]
  );

  const handleBack = useCallback(() => {
    navigate(returnListPath, {
      state: menuSidebarKeyFromState ? { menuSidebarKey: menuSidebarKeyFromState } : undefined,
    });
  }, [navigate, returnListPath, menuSidebarKeyFromState]);

  const handleGoToDetail = useCallback(() => {
    if (!pagoId) return;
    navigate(`/pagos/${pagoId}`, {
      state: {
        ...(menuSidebarKeyFromState ? { menuSidebarKey: menuSidebarKeyFromState } : {}),
        pagosTab: 'cuotas',
      },
    });
  }, [navigate, pagoId, menuSidebarKeyFromState]);

  const handleSubmit = useCallback(
    async (values) => {
      if (!selectedCuota?.id) return;

      const amountNum = roundBs(Number(montoCuota));
      if (Number.isNaN(amountNum) || amountNum < 0) {
        message.error('Monto inválido');
        return;
      }
      if (amountNum > montoMaximoCuota + 0.0001) {
        message.error(
          `El monto no puede superar ${money(montoMaximoCuota)} (total a pagar ${money(montoObligatorio)} menos otras cuotas ${money(totalOtros)})`
        );
        return;
      }

      try {
        setSaving(true);
        const methodId = Number(values.metodoPagoId);

        const payload = {
          amount: amountNum,
          payment_method_id: methodId,
          payment_account_id:
            methodId === 3 || methodId === 4
              ? values.cuentaPagoId ?? null
              : null,
          payment_date: dayjs(values.fechaPago).format('YYYY-MM-DD'),
          transaction_number:
            methodId === 3 || methodId === 4
              ? values.numeroTransaccion?.trim() || null
              : null,
          codigo_comprobante:
            methodId === 2 || methodId === 3 || methodId === 4
              ? values.codigoComprobante?.trim() || null
              : null,
          descripcion: values.descripcion?.trim() || null,
        };

        const uc = useCasesFactory.actualizarCuotaPagoAporte();
        const result = await uc.ejecutar(selectedCuota.id, payload);

        if (!result?.success) {
          message.error(result?.error || result?.message || 'No se pudo actualizar la cuota');
          return;
        }

        message.success('Cuota actualizada correctamente');

        // Regenerar y descargar automáticamente el recibo actualizado de la cuota editada.
        try {
          const ucRecibo = useCasesFactory.generarReciboPago();
          const reciboResult = await ucRecibo.ejecutar(selectedCuota.id);
          const reciboData = reciboResult?.data;
          if (reciboResult?.success && reciboData?.filePath) {
            await downloadFile(reciboData.filePath, reciboData.fileName || 'recibo_cuota.pdf');
            message.success('Recibo actualizado descargado');
          } else {
            message.warning('La cuota se actualizó, pero no se pudo descargar el recibo automáticamente');
          }
        } catch {
          message.warning('La cuota se actualizó, pero falló la descarga automática del recibo');
        }

        await refetchEstado();
        if (typeof refetchPago === 'function') await refetchPago();
        handleGoToDetail();
      } catch (err) {
        if (err?.errorFields) return;
        message.error(err?.message || 'Error al actualizar cuota');
      } finally {
        setSaving(false);
      }
    },
    [
      selectedCuota,
      montoCuota,
      montoMaximoCuota,
      montoObligatorio,
      totalOtros,
      message,
      refetchEstado,
      refetchPago,
      handleGoToDetail,
    ]
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Pagos', href: '/pagos' },
      { title: 'Editar cuota' },
    ],
    []
  );

  if (!pagoId || Number.isNaN(pagoId)) {
    return (
      <PageTemplate header={<PageHeader title="Editar cuota" breadcrumbItems={breadcrumbItems} />}>
        <Alert type="error" title="Identificador de pago no válido" showIcon />
      </PageTemplate>
    );
  }

  if (loadingPago) {
    return (
      <PageTemplate header={<PageHeader title="Editar cuota" breadcrumbItems={breadcrumbItems} />}>
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      </PageTemplate>
    );
  }

  if (errorPago || !pago?.id) {
    return (
      <PageTemplate header={<PageHeader title="Editar cuota" breadcrumbItems={breadcrumbItems} />}>
        <Alert type="error" title="No se pudo cargar el pago" description={errorPago || 'Pago no encontrado'} showIcon />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      header={
        <PageHeader
          title={`Editar Pago${pago?.estudiante?.nombreCompleto ? ` - ${pago.estudiante.nombreCompleto}` : ''}`}
          breadcrumbItems={breadcrumbItems}
          actions={
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              Volver al listado
            </Button>
          }
        />
      }
    >
      <div style={{ padding: 24 }}>
        {loadingEstado && <Spin size="large" />}
        {!!errorEstado && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            title="No se pudo cargar el estado del aporte"
            description={String(errorEstado)}
          />
        )}

        <StudentInfoSection student={buildStudent(pago)} />

        {hayVariasCuotas && (
          <Card title="Seleccionar cuota/recibo a editar" headerColor="primary" style={{ marginBottom: 24 }}>
            <Radio.Group
              value={selectedCuotaId}
              onChange={(e) => setSelectedCuotaId(e.target.value)}
              style={{ width: '100%' }}
            >
              <Space orientation="vertical" style={{ width: '100%' }}>
                {cuotas.map((c) => (
                  <Radio key={c.id} value={c.id}>
                    <Text strong>Recibo {c.numero_recibo ?? c.id}</Text>
                    <Text type="secondary"> · {money(c.monto)} · {String(c.fecha_pago || '').slice(0, 10)}</Text>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Card>
        )}

        {!selectedCuota ? (
          <Alert showIcon type="info" title="Seleccione una cuota para editar" />
        ) : (
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Card title="Detalle del Aporte" headerColor="primary" style={{ marginBottom: 24 }}>
              <div style={{ display: 'grid', gap: 14 }}>
                <Text strong>
                  Aporte Académico — Gestión {pago?.gestion?.nombre || pago?.gestion?.codigo || '—'}
                </Text>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Monto base</Text>
                  <Text strong>{money(montoBaseDetalle)}</Text>
                </div>
                {descuentoDetalle > 0 ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Descuento por beca</Text>
                    <Text type="secondary" strong>
                      −{money(descuentoDetalle)}
                    </Text>
                  </div>
                ) : null}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>
                    {descuentoDetalle > 0 ? 'Total a pagar (después del descuento)' : 'Total a pagar'}
                  </Text>
                  <Text strong>{money(montoObligatorio)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Saldo total de la deuda</Text>
                  <Text strong>{money(estadoAporte?.saldo_pendiente ?? 0)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Monto máximo para este recibo</Text>
                  <Text strong>{money(montoMaximoCuota)}</Text>
                </div>
                <div>
                  <Text>Monto de esta cuota</Text>
                  <InputNumber
                    value={montoCuota}
                    status={montoExcedeMaximo ? 'error' : undefined}
                    onChange={(v) => {
                      if (v === null || v === undefined || v === '') {
                        setMontoCuota(0);
                        return;
                      }
                      const n = roundBs(Number(v));
                      if (Number.isNaN(n) || n < 0) {
                        setMontoCuota(0);
                        return;
                      }
                      setMontoCuota(n);
                    }}
                    min={0}
                    step={0.01}
                    precision={2}
                    style={{ width: 260, marginLeft: 16 }}
                    prefix="Bs."
                  />
                  <div style={{ marginTop: 8, color: '#595959', fontSize: 12 }}>
                    Máximo permitido: {money(montoMaximoCuota)} (tope según total a pagar {money(montoObligatorio)}
                    {descuentoDetalle > 0 ? ', neto tras descuento' : ''} − otras cuotas {money(totalOtros)}).
                  </div>
                  {montoExcedeMaximo ? (
                    <div style={{ marginTop: 8, color: '#cf1322', fontSize: 13, fontWeight: 600 }}>
                      El monto ingresado supera el máximo permitido para esta cuota.
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>

            <PaymentMethodSelectionSection
              metodosPagoData={{
                metodosPago,
                loading: loadingCatalogos,
                error: null,
                selectedMetodoPago,
              }}
              onSelectMetodoPago={handleSelectMetodoPago}
              form={form}
              onFinish={handleSubmit}
            />

            {selectedMetodoPago && (
              <Card title="Completar información del pago" headerColor="primary">
                <PaymentFormFields
                  form={form}
                  cuentasPagoData={{
                    cuentasPago,
                    loading: loadingCatalogos,
                  }}
                  bancosAutorizadosData={{ bancosAutorizados }}
                  requiereFechaPago
                  requiereCuenta={requiresAccount}
                  requiereNumeroTransaccion={paymentMethodId === 3 || paymentMethodId === 4}
                  requiereCodigoComprobante={paymentMethodId === 2 || paymentMethodId === 3 || paymentMethodId === 4}
                  requiereDocumentoRespaldo={paymentMethodId !== 1}
                  esQR={paymentMethodId === 2}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  {montoExcedeMaximo ? (
                    <Text type="danger" style={{ maxWidth: 420, textAlign: 'right' }}>
                      Corrija el monto para poder guardar (máx. {money(montoMaximoCuota)}).
                    </Text>
                  ) : null}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <Button variant="default" onClick={handleBack}>
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      htmlType="submit"
                      loading={saving}
                      disabled={montoExcedeMaximo}
                      title={
                        montoExcedeMaximo
                          ? `El monto no puede ser mayor a ${money(montoMaximoCuota)}`
                          : undefined
                      }
                    >
                      Guardar cambios
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </Form>
        )}
      </div>
    </PageTemplate>
  );
};

export default PagosEditarCuota;
