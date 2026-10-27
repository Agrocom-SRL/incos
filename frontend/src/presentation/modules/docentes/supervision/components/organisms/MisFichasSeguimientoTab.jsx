/**
 * Organismo: tab "Supervisión" del portal del docente (DOC · ficha propia).
 *
 * Wrapper delgado sobre `useMisFichasSeguimientoSection` (S5, `/mis-fichas`,
 * anti-IDOR resuelto en el servidor) + tabla simple + panel de lectura con
 * `FichaSeguimientoFichaView` (organismo compartido, patrón "páginas
 * gemelas"). Sin permiso nuevo para DOCENTE: la carga es lazy (solo cuando la
 * tab está activa) y el docente ve ÚNICAMENTE sus propias fichas.
 */

import { Drawer, Empty, Flex, Spin, Typography } from 'antd';
import { CalendarOutlined, EyeOutlined, ReadOutlined, UserOutlined } from '@ant-design/icons';
import { DataTable } from '@molecules';
import { InfoLinesCell, StatusPill, Text } from '@atoms';
import { useMisFichasSeguimientoSection } from '@application-docentes/supervision/hooks/state/useMisFichasSeguimientoSection';
import {
  formatResultadoFichaLabel,
  getDocsCompletosPillClass,
} from '@application-docentes/supervision/utils/fichaSeguimientoPills';
import FichaSeguimientoFichaView from '@docentes/supervision/components/organisms/FichaSeguimientoFichaView';
import { allSpacing } from '@theme/tokens';

const { Paragraph } = Typography;

const MisFichasSeguimientoTab = ({ enabled = true }) => {
  const { fichas, loading, error, fichaSeleccionada, verFicha, cerrarFicha } =
    useMisFichasSeguimientoSection({ enabled });

  const columns = [
    {
      title: 'Fecha',
      key: 'fecha',
      width: 120,
      render: (_, record) => <InfoLinesCell lines={[{ icon: <CalendarOutlined />, label: record.fechaLabel }]} />,
    },
    {
      title: 'Asignatura',
      key: 'asignatura',
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            { icon: <ReadOutlined />, label: record.asignaturaLabel || record.asignaturaNombre },
            { label: record.carreraParaleloLabel },
          ]}
        />
      ),
    },
    {
      title: 'Evaluador',
      key: 'evaluador',
      width: 180,
      render: (_, record) => <InfoLinesCell lines={[{ icon: <UserOutlined />, label: record.evaluadorNombre }]} />,
    },
    {
      title: 'Resultado',
      key: 'resultado',
      width: 190,
      align: 'center',
      render: (_, record) => (
        <StatusPill
          label={formatResultadoFichaLabel(record)}
          className={getDocsCompletosPillClass(record.docsPresentados)}
        />
      ),
    },
    {
      title: '',
      key: 'ver',
      width: 48,
      align: 'right',
      render: (_, record) => (
        <button
          type="button"
          className="sd-btn sd-btn--icon"
          title="Ver ficha"
          aria-label="Ver ficha completa"
          onClick={() => verFicha(record)}
        >
          <EyeOutlined />
        </button>
      ),
    },
  ];

  return (
    <div className="sd-tab-body">
      <Paragraph type="secondary" className="cfg-academico-workspace__desc">
        Fichas de seguimiento en la clase presencial registradas por la Dirección Académica sobre
        sus cursos.
      </Paragraph>

      <Spin spinning={loading} tip="Cargando sus fichas de seguimiento…">
        {!loading && error ? (
          <Text type="danger">{error}</Text>
        ) : !loading && fichas.length === 0 ? (
          <Empty description="Aún no tiene fichas de seguimiento registradas." />
        ) : (
          <Flex vertical gap={allSpacing.margin}>
            <DataTable dataSource={fichas} columns={columns} rowKey={(r) => r.id} pagination={false} size="small" />
          </Flex>
        )}
      </Spin>

      <Drawer
        title="Ficha de seguimiento"
        placement="right"
        width={640}
        open={Boolean(fichaSeleccionada)}
        onClose={cerrarFicha}
        destroyOnHidden
      >
        {fichaSeleccionada ? <FichaSeguimientoFichaView ficha={fichaSeleccionada} /> : null}
      </Drawer>
    </div>
  );
};

export default MisFichasSeguimientoTab;
