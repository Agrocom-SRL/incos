/**
 * MisPasantiasSupervisadasPage — rama DOCENTE del ítem de menú Pasantías (TUT).
 *
 * Página GEMELA de `MisTutoradosPage` (TUT · Titulación): bandeja del docente
 * supervisor autenticado (P18, identidad resuelta en servidor). Acciones por
 * fila: abrir ficha y registrar seguimiento (drawer P16, gated por
 * seguimiento·CREAR). Orquestación en `useMisPasantiasSupervisadasPage`.
 */

import { Alert, Empty, Flex, Typography } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { useMisPasantiasSupervisadasPage } from '@application-titulacion/pasantias/hooks/state/useMisPasantiasSupervisadasPage';
import SeguimientoPasantiaDrawer from '@titulacion/pasantias/components/modals/SeguimientoPasantiaDrawer';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const MisPasantiasSupervisadasPage = () => {
  const {
    pasantias,
    loading,
    error,
    searchText,
    handleSearchChange,
    tableColumns,
    breadcrumbItems,
    seguimientoDrawer,
    cerrarSeguimiento,
    handleGuardarSeguimiento,
    guardandoSeguimiento,
  } = useMisPasantiasSupervisadasPage();

  const sinPasantias = !loading && !error && pasantias.length === 0 && !searchText;

  return (
    <PageTemplate
      header={<PageHeader title="Mis pasantías supervisadas" breadcrumbItems={breadcrumbItems} />}
      sidebar={null}
    >
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <section className="cfg-academico-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader title="Trámites bajo su supervisión" />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Trámites de pasantía en los que usted figura como docente supervisor. Registre las
              visitas en la hoja de seguimiento de cada trámite; desde la ficha puede revisar
              informes y el detalle completo.
            </Paragraph>
          </header>
          {error ? (
            <Alert
              type="warning"
              showIcon
              title="No se pudo cargar su lista de pasantías"
              description={error}
            />
          ) : sinPasantias ? (
            <div className="cfg-academico-tab-panel">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Aún no tiene trámites de pasantía bajo su supervisión."
              />
            </div>
          ) : (
            <div className="cfg-academico-tab-panel">
              <TableListView
                embedded
                data={pasantias}
                loading={loading}
                error={error}
                searchText={searchText}
                onSearchChange={handleSearchChange}
                searchPlaceholder="Buscar por estudiante, empresa o carrera…"
                columns={tableColumns}
                rowKey={(record) => record.id}
                searchColSpan={10}
                searchStyle={{ maxWidth: 520 }}
                loadingTip="Cargando sus pasantías…"
                emptyText="Ningún trámite coincide con la búsqueda."
              />
            </div>
          )}
        </section>
      </Flex>

      <SeguimientoPasantiaDrawer
        open={seguimientoDrawer.open}
        estudianteNombre={seguimientoDrawer.pasantia?.estudianteNombre}
        onClose={cerrarSeguimiento}
        onSubmit={handleGuardarSeguimiento}
        saving={guardandoSeguimiento}
      />
    </PageTemplate>
  );
};

export default MisPasantiasSupervisadasPage;
