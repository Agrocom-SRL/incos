/**
 * tableColumns - Columnas de la tabla de pagos de aportes (vista_pago_aporte_listado).
 *
 * Lenguaje visual alineado con el listado de Finanzas: `IdentidadCelda` con el ESTADO del
 * pago (Sin pagos / Parcial / Cancelado) como subtexto bajo el nombre (no columna propia);
 * montos con jerarquía; carrera como dot de color; y COMPROMISO con su fecha + pill de
 * alerta (Vencida / Próxima / Al día / Cumplido). El nombre NO se tiñe por carrera.
 */

import {
  CalendarOutlined, DollarOutlined, FileDoneOutlined, WalletOutlined,
} from '@ant-design/icons';
import { Space, Flex } from 'antd';
import {
  Text, IdentidadCelda, InfoLinesCell, StatusPill, CarreraDotCell,
  formatFechaCompromiso, compromisoSortValue, resolverCompromisoEstado,
} from '@atoms';
import PagoTableActions from './PagoTableActions';

/** Color semántico del compromiso (AntD) → clase de pill del design-system. */
const COMPROMISO_PILL = {
  error: 'cfg-materia-pill cfg-materia-pill--danger',
  warning: 'cfg-materia-pill cfg-materia-pill--warning',
  success: 'cfg-materia-pill cfg-materia-pill--success',
  default: 'cfg-materia-pill cfg-materia-pill--default',
};

/** Estado del aporte DERIVADO (para el subtexto bajo el nombre, estilo Finanzas). */
const derivarEstadoAporte = (record) => {
  const n = Number(record.cantidad_pagos ?? 0);
  const saldo = Number(record.saldo_pendiente ?? 0);
  const oblig = Number(record.monto_obligatorio ?? 0);
  if (saldo <= 0 && (n > 0 || oblig <= 0)) return { label: 'Cancelado', tone: 'success' };
  if (n === 0) return { label: 'Sin pagos', tone: 'warning' };
  return { label: 'Pago parcial', tone: 'warning' };
};

const formatBs = (v) => `Bs. ${Number(v ?? 0).toFixed(2)}`;

/**
 * Crea las columnas de la tabla de pagos de aportes.
 *
 * @param {Function} navigate
 * @param {Function} refetch
 * @param {Function} [deletePago]
 * @param {Object} [options] - viewNavigateState, returnListPath
 */
export const createPagosTableColumns = (navigate, refetch = null, deletePago = null, options = {}) => {
    const { viewNavigateState, returnListPath } = options;
    return [
        {
            title: '#',
            key: 'nro',
            width: 56,
            align: 'center',
            render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
        },
        {
            title: 'Estudiante',
            dataIndex: ['estudiante', 'nombreCompleto'],
            width: 260,
            ellipsis: true,
            render: (_, record) => {
                const estado = derivarEstadoAporte(record);
                return (
                    <div>
                        <IdentidadCelda
                            codigo={record.estudiante?.codigoEstudiante || null}
                            nombre={(record.estudiante?.nombreCompleto || record.estudiante?.codigoEstudiante || 'Sin nombre').toUpperCase()}
                        />
                        <span className={`cfg-identidad-substate cfg-identidad-substate--${estado.tone}`}>
                            <span className="cfg-identidad-substate__dot" aria-hidden />
                            {estado.label}
                        </span>
                    </div>
                );
            },
            sorter: (a, b) =>
                (a.estudiante?.nombreCompleto ?? a.estudiante?.codigoEstudiante ?? '').localeCompare(
                    b.estudiante?.nombreCompleto ?? b.estudiante?.codigoEstudiante ?? ''
                ),
        },
        {
            title: 'Gestión y carrera',
            dataIndex: 'gestion',
            width: 200,
            render: (gestion, record) => {
                const g = gestion || record.management;
                const gestionLabel = g ? (g.nombre || g.anio || String(g.id)) : null;
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <InfoLinesCell lines={[{ icon: <CalendarOutlined />, label: gestionLabel }]} />
                        <CarreraDotCell nombre={record.carrera?.nombre} colorHex={record.carrera?.colorHex} />
                    </div>
                );
            },
            sorter: (a, b) => {
                const ga = a.gestion || a.management;
                const gb = b.gestion || b.management;
                return (ga?.nombre || ga?.anio || '').localeCompare(gb?.nombre || gb?.anio || '');
            },
        },
        {
            title: 'Monto a pagar',
            dataIndex: 'monto_obligatorio',
            width: 200,
            align: 'right',
            render: (_, record) => {
                const base = Number(record.monto_base ?? 0);
                const desc = Number(record.descuento_beca ?? 0);
                const oblig = Number(record.monto_obligatorio ?? 0);
                const becaPct = record.beca_porcentaje ?? record.becaPorcentaje
                    ?? (base > 0 && desc > 0 ? Math.round((desc / base) * 100) : null);
                return (
                    <Space align="start" size={8}>
                        <DollarOutlined style={{ marginTop: 4 }} />
                        <Flex vertical align="flex-end" gap={2}>
                            <Text type="secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
                                Base {formatBs(base)}
                            </Text>
                            {desc > 0 ? (
                                <Flex align="center" gap={6}>
                                    <StatusPill
                                        label={`Beca ${becaPct != null ? `${becaPct}%` : ''}`.trim()}
                                        className="cfg-materia-pill cfg-materia-pill--info"
                                    />
                                    <Text type="secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
                                        -{formatBs(desc)}
                                    </Text>
                                </Flex>
                            ) : null}
                            <Text strong style={{ fontSize: 'var(--font-size-base)' }}>
                                {formatBs(oblig)}
                            </Text>
                        </Flex>
                    </Space>
                );
            },
            sorter: (a, b) => (a.monto_obligatorio ?? 0) - (b.monto_obligatorio ?? 0),
        },
        {
            title: 'Pagado',
            dataIndex: 'total_pagado',
            width: 160,
            render: (_, record) => {
                const t = Number(record.total_pagado ?? 0);
                const n = Number(record.cantidad_pagos ?? 0);
                if (n === 0) {
                    return <span className="cfg-materia-pill cfg-materia-pill--default">Sin pagos</span>;
                }
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Text strong style={{ fontSize: 'var(--font-size-base)' }}>{formatBs(t)}</Text>
                        <InfoLinesCell
                            lines={[{ icon: <FileDoneOutlined />, label: `${n} ${n === 1 ? 'cuota' : 'cuotas'}` }]}
                        />
                    </div>
                );
            },
            sorter: (a, b) => (a.total_pagado ?? 0) - (b.total_pagado ?? 0),
        },
        {
            title: 'Saldo',
            dataIndex: 'saldo_pendiente',
            width: 150,
            render: (val, record) => {
                const saldo = Number(val ?? record.saldo_pendiente ?? 0);
                const saldado = saldo <= 0;
                return (
                    <StatusPill
                        label={saldado ? 'Cancelado' : formatBs(saldo)}
                        className={`cfg-materia-pill ${saldado ? 'cfg-materia-pill--success' : 'cfg-materia-pill--danger'}`}
                    />
                );
            },
            sorter: (a, b) => (a.saldo_pendiente ?? 0) - (b.saldo_pendiente ?? 0),
        },
        {
            title: 'Compromiso',
            dataIndex: 'compromiso',
            width: 170,
            render: (compromiso) => {
                if (!compromiso) {
                    return <span className="cfg-materia-pill cfg-materia-pill--default">—</span>;
                }
                const { label, color } = resolverCompromisoEstado(compromiso);
                const fecha = formatFechaCompromiso(compromiso.fechaCompromiso);
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <InfoLinesCell
                            lines={[{ icon: <WalletOutlined />, label: fecha === '—' ? 'Sin fecha' : fecha }]}
                        />
                        <StatusPill label={label} className={COMPROMISO_PILL[color] || COMPROMISO_PILL.default} />
                    </div>
                );
            },
            sorter: (a, b) => compromisoSortValue(a?.compromiso) - compromisoSortValue(b?.compromiso),
        },
        {
            title: 'Acciones',
            key: 'acciones',
            width: 120,
            align: 'right',
            render: (_, record) => {
                const e = record.estudiante;
                const g = record.gestion || record.management;
                const nombre = e?.nombreCompleto ?? e?.codigoEstudiante ?? 'Sin nombre';
                const codigo = e?.codigoEstudiante ?? '—';
                const gestionLabel = g ? (g.nombre || g.anio || '') : 'N/A';
                const base = Number(record.monto_base ?? 0);
                const desc = Number(record.descuento_beca ?? 0);
                const oblig = Number(record.monto_obligatorio ?? 0);
                const saldo = Number(record.saldo_pendiente ?? 0);

                const itemName = `el aporte de ${nombre} (${gestionLabel})`;
                const itemDetails = [
                    { label: 'Estudiante', value: nombre },
                    { label: 'Código', value: codigo },
                    { label: 'Gestión', value: gestionLabel },
                    { label: 'Monto a pagar', value: `Base ${formatBs(base)} · Descuento ${formatBs(desc)} · Total ${formatBs(oblig)}` },
                    { label: 'Saldo pendiente', value: formatBs(saldo) },
                ].filter((d) => d.value && d.value !== 'N/A' && d.value !== '—');

                return (
                    <PagoTableActions
                        record={record}
                        navigate={navigate}
                        refetch={refetch}
                        deletePago={deletePago}
                        itemName={itemName}
                        itemDetails={itemDetails}
                        viewNavigateState={viewNavigateState}
                        onEdit={(r) => {
                            navigate(`/pagos/${r.id}/editar`, {
                                state: {
                                    ...(viewNavigateState || {}),
                                    ...(returnListPath ? { returnListPath } : {}),
                                },
                            });
                        }}
                        permisos={{
                            ver: [
                                { codigo: 'finanzas.pago.ver', accion: 'DETALLE' },
                                { codigo: 'matricula.pago.aporte.ver', accion: 'DETALLE' },
                            ],
                            editar: [
                                { codigo: 'finanzas.pago.editar', accion: 'EDITAR' },
                                { codigo: 'matricula.pago.aporte.ver', accion: 'EDITAR' },
                            ],
                            eliminar: [
                                { codigo: 'finanzas.pago.editar', accion: 'ELIMINAR' },
                                { codigo: 'matricula.pago.aporte.ver', accion: 'ELIMINAR' },
                            ],
                        }}
                    />
                );
            },
        },
    ];
};
