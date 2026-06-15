/**
 * Grilla de registro académico — acceso al cuaderno por bimestre (headers accionables).
 */

import {
  BookOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { Button, Table, Tag, Tooltip } from 'antd';
import CeldaSumaConAjusteInfo from './CeldaSumaConAjusteInfo.jsx';
import CeldaEstudiante from './CeldaEstudiante.jsx';
import {
  ESTADO_BIMESTRE_HEADER,
  resolverEstadoBimestreHeader,
  tooltipAbrirCuaderno,
} from '@application-academico/calificaciones/utils/bimestreConsolidadoUtils.js';

const ANCHO_COL_ESTUDIANTE = 30;

const ETIQUETA_ESTADO = {
  [ESTADO_BIMESTRE_HEADER.CERRADO]: 'CERRADO',
  [ESTADO_BIMESTRE_HEADER.EN_CURSO]: 'EN CURSO',
  [ESTADO_BIMESTRE_HEADER.PENDIENTE]: 'PENDIENTE',
};

const celdaNota = (valor) => (
  <span className="cal-consolidado-grid__nota">{valor != null ? valor : '—'}</span>
);

const celdaSumaBimestre = (bim) => (
  <CeldaSumaConAjusteInfo suma={bim?.suma} className="cal-consolidado-grid__celda-suma-wrap" />
);

const LeyendaEstados = () => (
  <div className="cal-consolidado-grid__leyenda-card" role="note" aria-label="Leyenda de estados de bimestre">
    <div className="cal-consolidado-grid__leyenda-item">
      <span className="cal-consolidado-grid__leyenda-muestra cal-consolidado-grid__leyenda-muestra--cerrado">
        <CheckCircleOutlined aria-hidden />
      </span>
      <span>
        <strong>Cerrado</strong> — ver consolidado del bimestre (práctico, teórico, total)
      </span>
    </div>
    <div className="cal-consolidado-grid__leyenda-item">
      <span className="cal-consolidado-grid__leyenda-muestra cal-consolidado-grid__leyenda-muestra--en-curso">
        <span className="cal-consolidado-grid__bim-dot" aria-hidden />
      </span>
      <span>
        <strong>En curso</strong> — registrar notas del bimestre vigente
      </span>
    </div>
    <div className="cal-consolidado-grid__leyenda-item">
      <span className="cal-consolidado-grid__leyenda-muestra cal-consolidado-grid__leyenda-muestra--pendiente">
        <LockOutlined aria-hidden />
      </span>
      <span>
        <strong>Pendiente</strong> — bloqueado por calendario académico
      </span>
    </div>
  </div>
);

const TituloBimestre = ({ titulo, numero, estadoCalendario, bimestreVigente, onAbrirCuaderno }) => {
  const estado = resolverEstadoBimestreHeader(numero, bimestreVigente, estadoCalendario);
  const cerrado = estado === ESTADO_BIMESTRE_HEADER.CERRADO;
  const enCurso = estado === ESTADO_BIMESTRE_HEADER.EN_CURSO;
  const pendiente = estado === ESTADO_BIMESTRE_HEADER.PENDIENTE;

  const iconoEstado = cerrado ? (
    <CheckCircleOutlined className="cal-consolidado-grid__bim-icon-estado" aria-hidden />
  ) : pendiente ? (
    <LockOutlined className="cal-consolidado-grid__bim-icon-estado" aria-hidden />
  ) : (
    <span className="cal-consolidado-grid__bim-dot" aria-hidden />
  );

  const abrir = () => {
    if (!pendiente && onAbrirCuaderno) onAbrirCuaderno(numero);
  };

  let accion = null;
  if (cerrado) {
    accion = (
      <Button
        size="small"
        className="cal-consolidado-grid__bim-btn cal-consolidado-grid__bim-btn--cerrado"
        icon={<EyeOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          abrir();
        }}
      >
        Ver consolidado
      </Button>
    );
  } else if (enCurso) {
    accion = (
      <Button
        size="small"
        className="cal-consolidado-grid__bim-btn cal-consolidado-grid__bim-btn--en-curso"
        icon={<BookOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          abrir();
        }}
      >
        Abrir cuaderno
      </Button>
    );
  } else {
    accion = (
      <Button
        size="small"
        disabled
        className="cal-consolidado-grid__bim-btn cal-consolidado-grid__bim-btn--pendiente"
        icon={<LockOutlined />}
      >
        Ver cuaderno
      </Button>
    );
  }

  return (
    <Tooltip title={tooltipAbrirCuaderno(numero, estado)} placement="top">
      <div className={['cal-consolidado-grid__bim-head', `cal-consolidado-grid__bim-head--${estado}`].join(' ')}>
        <div className="cal-consolidado-grid__bim-top">
          <span className="cal-consolidado-grid__bim-titulo-row">
            {iconoEstado}
            <span className="cal-consolidado-grid__bim-titulo">{titulo}</span>
          </span>
        </div>
        <span
          className={[
            'cal-consolidado-grid__bim-estado-tag',
            `cal-consolidado-grid__bim-estado-tag--${estado}`,
          ].join(' ')}
        >
          {ETIQUETA_ESTADO[estado]}
        </span>
        <div className="cal-consolidado-grid__bim-action">{accion}</div>
      </div>
    </Tooltip>
  );
};

const colBimestre = (titulo, indice, meta, bimestreVigente, onAbrirCuaderno) => {
  const estadoUi = resolverEstadoBimestreHeader(
    indice + 1,
    bimestreVigente,
    meta?.estadoCalendario,
  );
  const enCurso = estadoUi === ESTADO_BIMESTRE_HEADER.EN_CURSO;
  const pendiente = estadoUi === ESTADO_BIMESTRE_HEADER.PENDIENTE;

  const thBimClass = [
    'cal-consolidado-grid__th-bim',
    `cal-consolidado-grid__th-bim--${estadoUi}`,
    enCurso ? 'cal-consolidado-grid__col-bim-activo' : '',
    pendiente ? 'cal-consolidado-grid__col-bim-pendiente' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const thSubClass = [
    'cal-consolidado-grid__th-sub',
    `cal-consolidado-grid__th-sub--${estadoUi}`,
    enCurso ? 'cal-consolidado-grid__col-bim-activo' : '',
    pendiente ? 'cal-consolidado-grid__col-bim-pendiente' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const tdBimClass = (suffix = '') =>
    [
      'cal-consolidado-grid__col-num',
      enCurso ? 'cal-consolidado-grid__col-bim-activo' : '',
      pendiente ? 'cal-consolidado-grid__col-bim-pendiente' : '',
      enCurso ? 'cal-consolidado-grid__celda-activa' : '',
      suffix === 'suma' ? 'cal-consolidado-grid__col-suma' : '',
      enCurso && suffix === 'suma' ? 'cal-consolidado-grid__col-suma--activa' : '',
    ]
      .filter(Boolean)
      .join(' ');

  const onCellBim = (suffix = '') => () => ({
    className: tdBimClass(suffix),
  });

  return {
    title: (
      <TituloBimestre
        titulo={titulo}
        numero={indice + 1}
        estadoCalendario={meta?.estadoCalendario}
        bimestreVigente={bimestreVigente}
        onAbrirCuaderno={onAbrirCuaderno}
      />
    ),
    key: `bim-${indice}`,
    align: 'center',
    onHeaderCell: () => ({ className: thBimClass }),
    children: [
      {
        title: 'Teórico',
        key: `bim-${indice}-t`,
        width: 86,
        align: 'center',
        className: tdBimClass('teorico'),
        onHeaderCell: () => ({ className: thSubClass }),
        onCell: onCellBim('teorico'),
        render: (_, row) => celdaNota(row.bimestres?.[indice]?.teorico),
      },
      {
        title: 'Práctico',
        key: `bim-${indice}-p`,
        width: 86,
        align: 'center',
        className: tdBimClass('practico'),
        onHeaderCell: () => ({ className: thSubClass }),
        onCell: onCellBim('practico'),
        render: (_, row) => celdaNota(row.bimestres?.[indice]?.practico),
      },
      {
        title: 'Suma',
        key: `bim-${indice}-s`,
        width: 96,
        align: 'center',
        className: tdBimClass('suma'),
        onHeaderCell: () => ({ className: thSubClass }),
        onCell: onCellBim('suma'),
        render: (_, row) => celdaSumaBimestre(row.bimestres?.[indice]),
      },
    ],
  };
};

const ConsolidadoGrid = ({
  estudiantes = [],
  bimestreTitulos = [],
  bimestresCalendario = [],
  bimestreVigente = 1,
  notaMinimaAprobacion = 61,
  onAbrirCuaderno,
}) => {
  const metaPorNumero = new Map(
    (bimestresCalendario ?? []).map((b) => [Number(b.numero), b]),
  );

  const columns = [
    {
      title: 'Nro',
      dataIndex: 'nro',
      key: 'nro',
      width: 52,
      align: 'center',
      className: 'cal-consolidado-grid__col-nro',
      onHeaderCell: () => ({ className: 'cal-consolidado-grid__th-est' }),
    },
    {
      title: 'Estudiante',
      dataIndex: 'nombre',
      key: 'estudiante',
      width: ANCHO_COL_ESTUDIANTE,
      fixed: 'left',
      className: 'cal-consolidado-grid__col-estudiante',
      onHeaderCell: () => ({ className: 'cal-consolidado-grid__th-est' }),
      onCell: () => ({ className: 'cal-consolidado-grid__col-estudiante' }),
      render: (nombre, row) => (
        <CeldaEstudiante nombre={nombre} codigo={row.codigo ?? row.codigoEstudiante} />
      ),
    },
    ...bimestreTitulos.map((titulo, i) =>
      colBimestre(
        titulo,
        i,
        metaPorNumero.get(i + 1),
        bimestreVigente,
        onAbrirCuaderno,
      ),
    ),
    {
      title: 'Nota final',
      dataIndex: 'notaFinal',
      key: 'notaFinal',
      width: 112,
      align: 'center',
      className: 'cal-consolidado-grid__col-final',
      onHeaderCell: () => ({ className: 'cal-consolidado-grid__th-est' }),
      render: (v) => celdaNota(v),
    },
    {
      title: 'Recuperatorio',
      dataIndex: 'recuperatorio',
      key: 'recuperatorio',
      width: 100,
      align: 'center',
      onHeaderCell: () => ({ className: 'cal-consolidado-grid__th-est' }),
      render: (v) => celdaNota(v),
    },
    {
      title: 'Observación',
      dataIndex: 'observacion',
      key: 'observacion',
      width: 126,
      align: 'center',
      onHeaderCell: () => ({ className: 'cal-consolidado-grid__th-est' }),
      render: (obs, row) => {
        if (obs == null && row.notaFinal != null) {
          return (
            <span className="cal-consolidado-grid__obs-parcial" title="Gestión en curso">
              En curso
            </span>
          );
        }
        const etiqueta = obs ?? '—';
        const normalizada = String(obs ?? '').toUpperCase();
        let color;
        if (normalizada === 'APROBADO') color = 'success';
        else if (normalizada === 'REPROBADO') color = 'error';
        return (
          <Tag color={color} className="cal-consolidado-grid__obs">
            {etiqueta}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="cal-consolidado-grid-wrap">
      <LeyendaEstados />
      <Table
        className="cal-consolidado-grid"
        tableLayout="fixed"
        columns={columns}
        dataSource={estudiantes}
        rowKey="nro"
        pagination={false}
        size="small"
        bordered
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: 'Sin estudiantes matriculados en el curso' }}
      />
    </div>
  );
};

export default ConsolidadoGrid;
