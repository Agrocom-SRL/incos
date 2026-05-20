/**
 * Drawer de vista previa — notas calculadas del bimestre vigente (sin persistir).
 */

import { Alert, Button, Drawer, Skeleton, Table, Tag, Typography } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { useVistaPreviaNotas } from '@application-academico/calificaciones/hooks/useVistaPreviaNotas.js';

const { Text } = Typography;

const formatearNota = (valor) => (valor == null ? '—' : valor.toFixed(1));

const VistaPreviaDrawer = ({
  abierto,
  cursoId,
  bimestre,
  estudiantes = [],
  evaluaciones = [],
  onCerrar,
}) => {
  const { filas, validacionPesos, cuota, resumen, isLoading, error } =
    useVistaPreviaNotas({
      cursoId,
      abierto,
      estudiantes,
      evaluaciones,
    });

  const columns = [
    {
      title: 'Estudiante',
      dataIndex: 'nombre',
      key: 'nombre',
      ellipsis: true,
      width: '42%',
    },
    {
      title: `Teórico (/${cuota.teorico})`,
      dataIndex: 'notaTeorico',
      key: 'notaTeorico',
      align: 'center',
      width: '19%',
      render: (valor, row) => (
        <span
          className={
            row.incompletoTeorico ? 'cal-preview__celda--incompleta' : 'cal-preview__celda'
          }
          title={row.incompletoTeorico ? 'Faltan notas en evaluaciones teóricas' : undefined}
        >
          {formatearNota(valor)}
        </span>
      ),
    },
    {
      title: `Práctico (/${cuota.practico})`,
      dataIndex: 'notaPractico',
      key: 'notaPractico',
      align: 'center',
      width: '19%',
      render: (valor, row) => (
        <span
          className={
            row.incompletoPractico ? 'cal-preview__celda--incompleta' : 'cal-preview__celda'
          }
          title={row.incompletoPractico ? 'Faltan notas en evaluaciones prácticas' : undefined}
        >
          {formatearNota(valor)}
        </span>
      ),
    },
    {
      title: 'Bimestre',
      dataIndex: 'notaBimestre',
      key: 'notaBimestre',
      align: 'center',
      width: '20%',
      render: (valor, row) => {
        if (row.incompleto) {
          return (
            <Tag icon={<WarningOutlined />} color="warning" className="cal-preview__tag">
              Incompleto
            </Tag>
          );
        }
        const clase =
          valor != null && valor < 51
            ? 'cal-preview__celda cal-preview__celda--reprobado'
            : 'cal-preview__celda cal-preview__celda--bimestre';
        return <span className={clase}>{formatearNota(valor)}</span>;
      },
    },
  ];

  const footer = (
    <div className="cal-preview-drawer__footer">
      <Text type="secondary" className="cal-preview-drawer__nota-pie">
        Vista previa · no modifica notas cerradas ni guardadas en el cuaderno
      </Text>
      <Button type="primary" className="cal-eval-drawer__btn-primary" onClick={onCerrar}>
        Volver al cuaderno
      </Button>
    </div>
  );

  return (
    <Drawer
      title={`Vista previa · Bimestre ${bimestre ?? '—'}`}
      width={640}
      open={abierto}
      onClose={onCerrar}
      destroyOnClose
      footer={footer}
      className="cal-preview-drawer cal-eval-drawer"
    >
      {cuota.esOverride ? (
        <Alert
          type="info"
          showIcon
          className="cal-preview-drawer__alert"
          message={`Cuota del curso: ${cuota.teorico}% teórico · ${cuota.practico}% práctico`}
          description="Distinta a la institucional (30/70). Configurada en Ajustes del curso."
        />
      ) : null}

      {error ? (
        <Alert
          type="warning"
          showIcon
          title="No se cargó la cuota del curso; se usa 30/70 por defecto."
          className="cal-preview-drawer__alert"
        />
      ) : null}

      {validacionPesos.alertas.map((msg) => (
        <Alert
          key={msg}
          type="warning"
          showIcon
          message={msg}
          className="cal-preview-drawer__alert"
        />
      ))}

      {validacionPesos.pesosListos &&
      (validacionPesos.tieneTeorico || validacionPesos.tienePractico) ? (
        <Alert
          type="success"
          showIcon
          title="Los pesos de cada componente suman 100%."
          className="cal-preview-drawer__alert"
        />
      ) : null}

      {resumen.conFaltantes > 0 ? (
        <Alert
          type="info"
          showIcon
          className="cal-preview-drawer__alert"
          message={`${resumen.conFaltantes} estudiante${resumen.conFaltantes > 1 ? 's' : ''} con notas faltantes`}
          description="Completá las celdas vacías en el cuaderno para ver el bimestre calculado."
        />
      ) : null}

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <>
          <p className="cal-preview-drawer__resumen">
            {resumen.calculables} de {resumen.total} estudiantes con bimestre calculable
            {evaluaciones.length === 0 ? ' · sin evaluaciones en este bimestre' : ''}
          </p>
          <Table
            size="small"
            pagination={false}
            scroll={{ y: 360 }}
            columns={columns}
            dataSource={filas.map((f) => ({ ...f, key: f.estudianteId }))}
            className="cal-preview-drawer__table"
          />
        </>
      )}
    </Drawer>
  );
};

export default VistaPreviaDrawer;
