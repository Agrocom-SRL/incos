import { useMemo } from 'react';
import { BookOutlined } from '@ant-design/icons';
import { Table, Typography } from 'antd';
import DetailInfoCard from '@molecules/DetailInfoCard';
import { buildOfertaParaleloDetalleCursosColumns } from '../../config/ofertaParaleloDetalleCursosColumns';

const { Text } = Typography;

const OfertaParaleloDetalleCursosSection = ({
  ofertaCursos = [],
  cargaHorariaResumen,
  faltantesDocenteIds,
  onAsignarDocente,
}) => {
  const columns = useMemo(
    () =>
      buildOfertaParaleloDetalleCursosColumns({
        faltantesDocenteIds,
        onAsignarDocente,
      }),
    [faltantesDocenteIds, onAsignarDocente]
  );

  const docentePendientes = useMemo(() => {
    if (!ofertaCursos.length) return 0;
    return ofertaCursos.filter((c) => faltantesDocenteIds.has(Number(c.id))).length;
  }, [ofertaCursos, faltantesDocenteIds]);

  return (
    <Table
      rowKey="id"
      size="small"
      pagination={false}
      dataSource={ofertaCursos}
      columns={columns}
      className="oferta-paralelo-detalle-cursos__table"
      scroll={{ x: 'max-content' }}
      locale={{
        emptyText:
          'Sin cursos en la oferta. Genere la oferta desde Planes vigentes con «Generar paralelos».',
      }}
      summary={() =>
        ofertaCursos.length ? (
          <Table.Summary.Row className="oferta-paralelo-detalle-cursos__summary">
            <Table.Summary.Cell index={0} colSpan={2}>
              <Text strong>Total horas semanales ofertadas</Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2} align="center">
              <Text strong>{cargaHorariaResumen.horasOfertadas}</Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={3}>
              <Text type="secondary">
                {docentePendientes > 0
                  ? `${docentePendientes} sin docente`
                  : 'Docentes completos'}
              </Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={4} colSpan={2} />
          </Table.Summary.Row>
        ) : null
      }
    />
  );
};

export default OfertaParaleloDetalleCursosSection;
