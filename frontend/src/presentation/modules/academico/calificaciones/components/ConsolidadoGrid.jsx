/**
 * Grilla de registro académico — acceso al cuaderno por bimestre (headers accionables).
 */

import {
  CheckCircleOutlined,
  ExportOutlined,
  LockOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { Button, Table, Tag, Tooltip } from 'antd';
import {
  ESTADO_BIMESTRE_HEADER,
  etiquetaEstadoBimestre,
  resolverEstadoBimestreHeader,
  tooltipAbrirCuaderno,
} from '@application-academico/calificaciones/utils/bimestreConsolidadoUtils.js';

const celdaNota = (valor) => (
  <span className="cal-consolidado-grid__nota">{valor != null ? valor : '—'}</span>
);

const celdaVacia = (row, indice) => {
  const b = row.bimestres?.[indice];
  return b?.teorico == null && b?.practico == null && b?.suma == null;
};

const TituloBimestre = ({ titulo, numero, estadoCalendario, bimestreVigente, onAbrirCuaderno }) => {
  const estado = resolverEstadoBimestreHeader(numero, bimestreVigente, estadoCalendario);
  const bloqueado = estado === ESTADO_BIMESTRE_HEADER.PENDIENTE;
  const enCurso = estado === ESTADO_BIMESTRE_HEADER.EN_CURSO;

  const handleClick = () => {
    if (!bloqueado && onAbrirCuaderno) onAbrirCuaderno(numero);
  };

  const iconoEstado =
    estado === ESTADO_BIMESTRE_HEADER.CERRADO ? (
      <CheckCircleOutlined aria-hidden />
    ) : estado === ESTADO_BIMESTRE_HEADER.PENDIENTE ? (
      <LockOutlined aria-hidden />
    ) : (
      <span className="cal-consolidado-grid__bim-dot" aria-hidden />
    );

  const contenido = (
    <div
      className={[
        'cal-consolidado-grid__bim-head',
        `cal-consolidado-grid__bim-head--${estado}`,
        bloqueado ? 'cal-consolidado-grid__bim-head--locked' : 'cal-consolidado-grid__bim-head--clickable',
      ].join(' ')}
      onClick={bloqueado ? undefined : handleClick}
      onKeyDown={(e) => {
        if (bloqueado) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      role={bloqueado ? undefined : 'button'}
      tabIndex={bloqueado ? undefined : 0}
    >
      <div className="cal-consolidado-grid__bim-top">
        <span className="cal-consolidado-grid__bim-titulo-row">
          {iconoEstado}
          <span className="cal-consolidado-grid__bim-titulo">{titulo}</span>
        </span>
        {!bloqueado ? (
          <ExportOutlined className="cal-consolidado-grid__bim-icon-link" aria-hidden />
        ) : null}
      </div>

      {enCurso ? (
        <span className="cal-consolidado-grid__bim-badge">EN CURSO</span>
      ) : (
        <span className="cal-consolidado-grid__bim-estado-label">
          {etiquetaEstadoBimestre(estado)}
        </span>
      )}

      {!bloqueado ? (
        enCurso ? (
          <Button
            type="primary"
            size="small"
            className="cal-consolidado-grid__bim-cta"
            icon={<BookOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onAbrirCuaderno?.(numero);
            }}
          >
            Abrir cuaderno
          </Button>
        ) : (
          <Button
            type="link"
            size="small"
            className="cal-consolidado-grid__bim-cta-link"
            onClick={(e) => {
              e.stopPropagation();
              onAbrirCuaderno?.(numero);
            }}
          >
            Ver cuaderno
          </Button>
        )
      ) : null}
    </div>
  );

  return (
    <Tooltip title={tooltipAbrirCuaderno(numero, estado)} placement="top">
      {contenido}
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

  const headerClass = `cal-consolidado-grid__th-bim cal-consolidado-grid__th-bim--${estadoUi}`;

  const subColClass = (suffix) =>
    [
      'cal-consolidado-grid__col-num',
      enCurso ? 'cal-consolidado-grid__col-bim-activo' : '',
      suffix === 'suma' ? 'cal-consolidado-grid__col-suma' : '',
    ]
      .filter(Boolean)
      .join(' ');

  const onCellBim = (_, row) => ({
    className: [
      enCurso && celdaVacia(row, indice) ? 'cal-consolidado-grid__celda-activa' : '',
      subColClass(''),
    ]
      .filter(Boolean)
      .join(' '),
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
    className: headerClass,
    onHeaderCell: () => ({
      className: headerClass,
    }),
    children: [
      {
        title: 'Teórico',
        key: `bim-${indice}-t`,
        width: 76,
        align: 'center',
        className: subColClass(''),
        onHeaderCell: () => ({ className: 'cal-consolidado-grid__th-sub' }),
        onCell: onCellBim,
        render: (_, row) => celdaNota(row.bimestres?.[indice]?.teorico),
      },
      {
        title: 'Práctico',
        key: `bim-${indice}-p`,
        width: 76,
        align: 'center',
        className: subColClass(''),
        onHeaderCell: () => ({ className: 'cal-consolidado-grid__th-sub' }),
        onCell: onCellBim,
        render: (_, row) => celdaNota(row.bimestres?.[indice]?.practico),
      },
      {
        title: 'Suma',
        key: `bim-${indice}-s`,
        width: 76,
        align: 'center',
        className: subColClass('suma'),
        onHeaderCell: () => ({ className: 'cal-consolidado-grid__th-sub' }),
        onCell: onCellBim,
        render: (_, row) => celdaNota(row.bimestres?.[indice]?.suma),
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
      fixed: 'left',
      className: 'cal-consolidado-grid__col-nro',
      onHeaderCell: () => ({ className: 'cal-consolidado-grid__th-est' }),
    },
    {
      title: 'Estudiante',
      key: 'estudiante',
      onHeaderCell: () => ({ className: 'cal-consolidado-grid__th-est' }),
      children: [
        {
          title: 'Código',
          dataIndex: 'codigo',
          key: 'codigo',
          width: 108,
          className: 'cal-consolidado-grid__col-codigo',
          onHeaderCell: () => ({ className: 'cal-consolidado-grid__th-sub' }),
        },
        {
          title: 'Nombres y apellidos',
          dataIndex: 'nombre',
          key: 'nombre',
          width: 220,
          ellipsis: true,
          className: 'cal-consolidado-grid__col-nombre',
          onHeaderCell: () => ({ className: 'cal-consolidado-grid__th-sub' }),
        },
      ],
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
      width: 92,
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
      width: 116,
      align: 'center',
      onHeaderCell: () => ({ className: 'cal-consolidado-grid__th-est' }),
      render: (obs, row) => {
        const aprobado =
          row.notaFinal != null && row.notaFinal >= notaMinimaAprobacion;
        return (
          <Tag
            color={aprobado ? 'success' : 'warning'}
            className="cal-consolidado-grid__obs"
          >
            {obs ?? '—'}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="cal-consolidado-grid-wrap">
      <div className="cal-consolidado-grid__leyenda-estados">
        <span>
          <CheckCircleOutlined /> Cerrado — abrir cuaderno para consulta o carga
        </span>
        <span>
          <span className="cal-consolidado-grid__bim-dot cal-consolidado-grid__bim-dot--inline" /> En
          curso — registrar notas
        </span>
        <span>
          <LockOutlined /> Pendiente — bloqueado por calendario
        </span>
      </div>
      <Table
        className="cal-consolidado-grid"
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
