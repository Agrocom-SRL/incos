/**
 * MisAportesPage — portal del estudiante (ítem "Mis aportes", MAT-APO-LISTA).
 *
 * SOLO LECTURA: resumen del aporte + pagos realizados. Sin registrar, editar,
 * anular ni descargar recibos/comprobantes. La lógica vive en `useMisAportes`.
 */

import { DollarOutlined, ProfileOutlined, WalletOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Row, Segmented, Spin, Statistic, Tag, theme } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader, DetailInfoCard, DataTable } from '@molecules';
import { DetailField } from '@atoms';
import { DetailPageShell } from '@organisms';
import { formatBsConSimbolo } from '@application/utils/formatters';
import { useMisAportes } from '@application-pagos/hooks/state/useMisAportes.js';
import { misAportesCuotasColumns } from '@pagos/config/misAportesCuotasColumns.jsx';

const conceptoAporte = (aporte) => {
  const gestion = aporte?.gestion?.nombre || aporte?.gestion?.anio;
  return gestion ? `Aporte académico — Gestión ${gestion}` : 'Aporte académico';
};

const MisAportesPage = () => {
  const { token } = theme.useToken();
  const {
    aportes,
    resumen,
    loading,
    error,
    selectedId,
    setSelectedId,
    selectedAporte,
    cuotas,
    loadingDetalle,
    errorDetalle,
    breadcrumbItems,
  } = useMisAportes();

  const sinAportes = !loading && !error && aportes.length === 0;

  const opcionesAporte = aportes.map((a) => ({
    label: a?.gestion?.nombre || a?.gestion?.anio || `Aporte #${a.id}`,
    value: a.id,
  }));

  return (
    <PageTemplate
      header={<PageHeader title="Mis aportes" breadcrumbItems={breadcrumbItems} />}
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando tus aportes…"
        error={error}
        showEmpty={sinAportes}
        emptyDescription="No tienes aportes registrados."
      >
        {/* Resumen general */}
        {resumen ? (
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title="Aportes"
                  value={resumen.cantidadAportes ?? aportes.length}
                  prefix={<ProfileOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title="Monto obligatorio"
                  value={formatBsConSimbolo(resumen.montoObligatorio)}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title="Total pagado"
                  value={formatBsConSimbolo(resumen.totalPagado)}
                  valueStyle={{ color: token.colorSuccess }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title="Saldo pendiente"
                  value={formatBsConSimbolo(resumen.saldoPendiente)}
                  valueStyle={{
                    color:
                      Number(resumen.saldoPendiente) > 0
                        ? token.colorError
                        : token.colorTextSecondary,
                  }}
                />
              </Card>
            </Col>
          </Row>
        ) : null}

        {/* Selector de aporte (solo si hay más de uno) */}
        {opcionesAporte.length > 1 ? (
          <Segmented
            options={opcionesAporte}
            value={selectedId}
            onChange={(value) => setSelectedId(value)}
            style={{ marginBottom: 16 }}
          />
        ) : null}

        {/* Detalle del aporte seleccionado */}
        {selectedAporte ? (
          <DetailInfoCard
            title="Resumen del aporte"
            icon={<WalletOutlined />}
            cols={2}
            headVariant="resumen"
            extra={
              selectedAporte.estado ? (
                <Tag color="blue" style={{ margin: 0 }}>
                  {selectedAporte.estado}
                </Tag>
              ) : null
            }
          >
            <DetailField label="Concepto">{conceptoAporte(selectedAporte)}</DetailField>
            <DetailField label="Gestión">
              {selectedAporte.gestion?.nombre || selectedAporte.gestion?.anio || '—'}
            </DetailField>
            <DetailField label="Monto base">
              {formatBsConSimbolo(selectedAporte.monto_base)}
            </DetailField>
            <DetailField label="Descuento por beca">
              {selectedAporte.beca?.nombre
                ? `${selectedAporte.beca.nombre}${
                    selectedAporte.beca?.porcentaje != null
                      ? ` (${selectedAporte.beca.porcentaje}%)`
                      : ''
                  }`
                : formatBsConSimbolo(selectedAporte.descuento_beca)}
            </DetailField>
            <DetailField label="Monto obligatorio">
              {formatBsConSimbolo(selectedAporte.monto_obligatorio)}
            </DetailField>
            <DetailField label="Total pagado">
              {formatBsConSimbolo(selectedAporte.total_pagado)}
            </DetailField>
            <DetailField label="Pagos realizados">
              {selectedAporte.cantidad_pagos ?? cuotas.length}
            </DetailField>
            <DetailField label="Saldo pendiente">
              {Number(selectedAporte.saldo_pendiente) > 0 ? (
                <span style={{ color: token.colorError }}>
                  {formatBsConSimbolo(selectedAporte.saldo_pendiente)}
                </span>
              ) : (
                formatBsConSimbolo(selectedAporte.saldo_pendiente)
              )}
            </DetailField>
          </DetailInfoCard>
        ) : null}

        {/* Pagos realizados */}
        {selectedAporte ? (
          <DetailInfoCard title="Pagos realizados" icon={<DollarOutlined />} cols={1}>
            {errorDetalle ? (
              <Empty description={errorDetalle} />
            ) : (
              <Spin spinning={loadingDetalle} tip="Cargando pagos…">
                {cuotas.length > 0 ? (
                  <DataTable
                    dataSource={cuotas}
                    columns={misAportesCuotasColumns}
                    rowKey={(record) => record.id ?? record.numero}
                    pagination={false}
                    size="small"
                  />
                ) : (
                  <Empty description="Aún no hay pagos registrados." />
                )}
              </Spin>
            )}
          </DetailInfoCard>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default MisAportesPage;
