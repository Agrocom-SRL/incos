import { useMemo, useState } from 'react';
import { Flex, Typography } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { ActionButton, BackButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useCronogramaAdminState } from '@application-institucional/actual';
import { getActividadTipoLabel } from '@application-institucional/actual/config/actividadPill.js';
import { createCronogramaTableColumns } from '@institucional/actual/config/cronogramaTableColumns.jsx';
import '@configuracion/academico/styles/academico-form-page.css';
import '@institucional/actual/styles/cronograma.css';

const PERMISO = 'institucional.gestion.cronograma';

const { Paragraph } = Typography;

const CronogramaAdminPage = () => {
  const s = useCronogramaAdminState();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const data = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return s.actividades;
    return s.actividades.filter((a) =>
      [a.nombre, a.periodoNombre, a.codigo, getActividadTipoLabel(a.tipo)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [s.actividades, searchText]);

  const columns = useMemo(
    () =>
      createCronogramaTableColumns({
        navigate,
        onVer: s.goToDetalle,
        onEditar: s.goToEditar,
        eliminar: s.eliminar,
        refetch: s.refetch,
      }),
    [navigate, s.goToDetalle, s.goToEditar, s.eliminar, s.refetch],
  );

  const nuevaAction = (
    <ActionButton
      permiso={PERMISO}
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={s.goToNueva}
    >
      Nueva actividad
    </ActionButton>
  );

  return (
    <PageTemplate
      header={
        <PageHeader
          title={s.pageTitle}
          breadcrumbItems={s.breadcrumbItems}
          actions={
            <BackButton icon={<ArrowLeftOutlined />} onClick={s.goToPanel}>
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
              title={s.gestion ? `Cronograma — ${s.gestion.nombre}` : 'Cronograma de la gestión'}
              actions={nuevaAction}
            />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Actividades del calendario académico de la gestión vigente, agrupadas por etapa. Cada
              etapa conserva su color propio; las actividades sin fecha de fin son de un solo día.
            </Paragraph>
          </header>
          <div className="cfg-academico-tab-panel">
            <TableListView
              embedded
              data={data}
              loading={s.loading}
              error={s.error}
              columns={columns}
              rowKey={(record) => record.id}
              searchText={searchText}
              onSearchChange={(e) => setSearchText(e.target.value)}
              searchPlaceholder="Buscar por actividad, etapa, código o tipo…"
              loadingTip="Cargando cronograma…"
              pagination={{ pageSize: 10, showTotal: (total) => `Total: ${total} actividades` }}
            />
          </div>
        </section>
      </Flex>
    </PageTemplate>
  );
};

export default CronogramaAdminPage;
