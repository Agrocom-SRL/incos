/**
 * Planilla de control de cuentas por cobrar a estudiantes por carrera y paralelo
 * (Finanzas · reporte read-only).
 *
 * Página "dumb": compone template + organismos y consume `useCuentasPorCobrarPage`.
 * No hace fetch ni orquesta (eso vive en el provider + hook de estado).
 *
 * Estructura (faithful a la planilla de referencia):
 *   cabecera (gestión, modalidad, monto máximo por estudiante, fecha de emisión)
 *   → una SECCIÓN por carrera (sub-tabla por paralelo + totales de carrera)
 *   → resumen general + bloque destacado de monto total pendiente
 *   → leyenda de alertas + observaciones generales.
 */

import { Alert, Descriptions, Empty, Flex, Spin, Tag, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { BackButton } from '@atoms';
import { useCuentasPorCobrarPage } from '@application-finanzas/hooks/state/useCuentasPorCobrarPage';
import { createCuentasPorCobrarColumns, formatBs, formatFecha } from '@finanzas/reportes/config/cuentasPorCobrarColumns';
import CuentasPorCobrarCarreraSection from '@finanzas/reportes/components/organisms/CuentasPorCobrarCarreraSection';
import CuentasPorCobrarResumen from '@finanzas/reportes/components/organisms/CuentasPorCobrarResumen';
import CuentasPorCobrarLeyenda from '@finanzas/reportes/components/organisms/CuentasPorCobrarLeyenda';
import { allSpacing } from '@theme/tokens';
import '@configuracion/academico/styles/academico-form-page.css';
import '@finanzas/reportes/styles/cuentas-por-cobrar.css';

const { Paragraph } = Typography;

/** Etiqueta de gestión vigente del reporte (Tag informativo, read-only). */
const renderGestionTag = (gestion) => {
  if (!gestion) return null;
  const label = gestion.nombre || (gestion.anio != null ? String(gestion.anio) : null);
  if (!label) return null;
  return <Tag color="processing">Gestión {label}</Tag>;
};

const CuentasPorCobrarPage = () => {
  const navigate = useNavigate();
  const {
    loading,
    error,
    isEmpty,
    breadcrumbItems,
    gestion,
    montoMaximoPorEstudiante,
    fechaEmision,
    carreras,
    resumen,
    leyenda,
    observacionesGenerales,
  } = useCuentasPorCobrarPage();

  const columns = createCuentasPorCobrarColumns();

  let body;
  if (loading) {
    body = (
      <Flex align="center" justify="center" style={{ minHeight: allSpacing.skeletonCardHeight }}>
        <Spin size="large" tip="Cargando cuentas por cobrar..." />
      </Flex>
    );
  } else if (error) {
    body = <Alert type="error" showIcon title="No se pudo cargar el reporte" description={error} />;
  } else if (isEmpty) {
    body = <Empty description="No hay carreras con cuentas por cobrar en la gestión" />;
  } else {
    body = (
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <Descriptions
          size="small"
          bordered
          column={{ xs: 1, sm: 2, lg: 4 }}
          items={[
            {
              key: 'gestion',
              label: 'Gestión',
              children: gestion?.nombre || gestion?.anio || '—',
            },
            { key: 'modalidad', label: 'Modalidad', children: 'ANUALIZADA' },
            {
              key: 'maximo',
              label: 'Monto máximo por estudiante',
              children: `${formatBs(montoMaximoPorEstudiante)} Bs`,
            },
            {
              key: 'emision',
              label: 'Fecha de emisión',
              children: formatFecha(fechaEmision),
            },
          ]}
        />

        <CuentasPorCobrarResumen resumen={resumen} />

        <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
          {carreras.map((carrera) => (
            <CuentasPorCobrarCarreraSection
              key={carrera.carreraId ?? carrera.carreraNombre}
              carrera={carrera}
              columns={columns}
            />
          ))}
        </Flex>

        <CuentasPorCobrarLeyenda leyenda={leyenda} observaciones={observacionesGenerales} />
      </Flex>
    );
  }

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Cuentas por cobrar"
          breadcrumbItems={breadcrumbItems}
          actions={
            <BackButton icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Volver
            </BackButton>
          }
        />
      }
      sidebar={null}
    >
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <section className="cfg-academico-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader
              title="Planilla de control de cuentas por cobrar"
              actions={renderGestionTag(gestion)}
            />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Cuentas por cobrar a estudiantes por carrera y paralelo: saldo pendiente, fecha de
              compromiso, días de atraso y estado de cobranza. Reporte de solo lectura.
            </Paragraph>
          </header>
          <div className="cfg-academico-tab-panel">{body}</div>
        </section>
      </Flex>
    </PageTemplate>
  );
};

export default CuentasPorCobrarPage;
