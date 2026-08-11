/**
 * Seguimiento de tutorías a docentes (Titulación · TIT ·
 * `proyecto·LISTAR`/`EXPORTAR`, extensión 2026-08-10) — reemplaza la
 * "planilla de avance 10 en 10" de 3er año (dependía de
 * Matrícula/periodo_numero=3, sin datos en desarrollo, sin documento físico
 * real). Reporte ADMINISTRATIVO: verifica que cada docente-tutor cumpla sus
 * tutorías, no el avance de los estudiantes.
 *
 * Filtros docente / carrera / mes (los 3 OPCIONALES, NINGUNO bloquea la
 * carga: sin filtrar el backend usa el mes/año actual del servidor) como fila
 * simple sin sección propia, un bloque por docente-tutor abajo, botón
 * "Exportar Excel" + "Volver" en la cabecera. Página "dumb": la orquestación
 * vive en `useSeguimientoTutoriaDocentesPage`.
 */

import { Alert, DatePicker, Empty, Flex, Select, Spin, Typography } from 'antd';
import { ArrowLeftOutlined, FileExcelOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useSeguimientoTutoriaDocentesPage } from '@application-titulacion/proyectos-grado/hooks/state/useSeguimientoTutoriaDocentesPage';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import SeguimientoTutoriaDocentesTablero from '@titulacion/proyectos-grado/components/organisms/SeguimientoTutoriaDocentesTablero';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';
import '../styles/planilla-avance.css';

const { Text } = Typography;

/** Periodo efectivamente mostrado (resuelto por el servidor si no se filtró). */
const formatPeriodo = (anio, mes) =>
  anio != null && mes != null ? dayjs(`${anio}-${mes}-01`).format('MMMM [de] YYYY') : null;

const SeguimientoTutoriaDocentesPage = () => {
  const {
    seguimiento,
    loading,
    error,
    handleExportar,
    exportando,
    handleVolver,
    breadcrumbItems,
    carreraOptions,
    loadingCarreras,
    docentes,
    loadingDocentes,
    docenteId,
    setDocenteId,
    carreraId,
    setCarreraId,
    periodo,
    setPeriodo,
  } = useSeguimientoTutoriaDocentesPage();

  const headerActions = (
    <Flex gap="small" wrap>
      <ActionButton
        permiso={TITULACION_PERMISOS.proyecto}
        accion="EXPORTAR"
        variant="primary"
        icon={<FileExcelOutlined />}
        loading={exportando}
        onClick={handleExportar}
        disabled={loading}
      >
        Exportar Excel
      </ActionButton>
      <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver}>
        Volver
      </BackButton>
    </Flex>
  );

  const periodoTexto = formatPeriodo(seguimiento?.anio, seguimiento?.mes);
  const hayDocentes = !loading && !error && seguimiento && seguimiento.docentes.length > 0;

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title="Seguimiento de tutorías a docentes"
          breadcrumbItems={breadcrumbItems}
          actions={headerActions}
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
            <Flex wrap gap="small" align="center">
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                options={docentes}
                loading={loadingDocentes}
                value={docenteId}
                onChange={setDocenteId}
                placeholder="Seleccione el docente"
                style={{ minWidth: 240 }}
                aria-label="Filtrar por docente"
              />
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                options={carreraOptions}
                loading={loadingCarreras}
                value={carreraId}
                onChange={setCarreraId}
                placeholder="Seleccione la carrera"
                style={{ minWidth: 220 }}
                aria-label="Filtrar por carrera"
              />
              <DatePicker
                picker="month"
                allowClear
                value={periodo}
                onChange={setPeriodo}
                placeholder="Mes en curso"
                style={{ minWidth: 180 }}
                aria-label="Filtrar por mes"
              />
            </Flex>

            {periodoTexto ? (
              <Text type="secondary">
                Mostrando el seguimiento de <strong>{periodoTexto}</strong>.
              </Text>
            ) : null}

            <Spin spinning={loading} size="large" tip="Cargando seguimiento de tutorías…">
              <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
                {!loading && error ? (
                  <Alert
                    type="error"
                    showIcon
                    title="No se pudo cargar el seguimiento de tutorías a docentes"
                    description={error}
                  />
                ) : null}

                {!loading && !error && (!seguimiento || seguimiento.docentes.length === 0) ? (
                  <Empty
                    style={{ marginTop: allSpacing.marginXL }}
                    description="No hay docentes-tutores con tutoriados activos para los filtros seleccionados."
                  />
                ) : null}

                {hayDocentes ? <SeguimientoTutoriaDocentesTablero docentes={seguimiento.docentes} /> : null}
              </Flex>
            </Spin>
          </Flex>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default SeguimientoTutoriaDocentesPage;
