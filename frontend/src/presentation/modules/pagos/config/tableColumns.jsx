/**
 * tableColumns - Columnas de la tabla de pagos de aportes (vista_pago_aporte_listado).
 *
 * Lenguaje visual del prototipo de listado: `#` numérico + `IdentidadCelda` (estudiante),
 * `InfoLinesCell` (gestión) y `StatusPill` (estado), con las clases del design-system
 * (`styles/components/atoms/table-cells.css`). Las celdas monetarias conservan su formato
 * numérico a la derecha (base/descuento/total, saldo, compromiso).
 */

import { UserOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons';
import { Space, Flex } from 'antd';
import { TableCell } from '@molecules';
import {
  Text, IdentidadCelda, InfoLinesCell, StatusPill,
  CompromisoAlertTag, formatFechaCompromiso, compromisoSortValue,
} from '@atoms';
import PagoTableActions from './PagoTableActions';

/** Punto de color (data-driven) para chip de carrera. */
const colorDot = (color) => (
    <span
        style={{
            width: 10, height: 10, borderRadius: 999,
            background: color || 'var(--border, #d1d5db)', display: 'inline-block',
        }}
    />
);

/** Estado del aporte → clase de pill semántica (StatusPill). */
const getEstadoAportePillClass = (estado) => {
  const e = String(estado || '').toUpperCase();
  if (e === 'PENDIENTE') return 'cfg-materia-pill cfg-materia-pill--warning';
  if (e === 'CANCELADO') return 'cfg-materia-pill cfg-materia-pill--default';
  return 'cfg-materia-pill cfg-materia-pill--success';
};

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
            title: 'Gestión y carrera',
            dataIndex: 'gestion',
            width: 200,
            render: (gestion, record) => {
                const g = gestion || record.management;
                const gestionLabel = g ? (g.nombre || g.anio || String(g.id)) : null;
                const carrera = record.carrera;
                const carreraLabel = carrera?.nombre
                    ? `${carrera.nombre}${carrera.codigo ? ` · ${carrera.codigo}` : ''}`
                    : null;
                return (
                    <InfoLinesCell
                        lines={[
                            { icon: <CalendarOutlined />, label: gestionLabel },
                            { icon: colorDot(carrera?.colorHex), label: carreraLabel },
                        ]}
                    />
                );
            },
            sorter: (a, b) => {
                const ga = a.gestion || a.management;
                const gb = b.gestion || b.management;
                return (ga?.nombre || ga?.anio || '').localeCompare(gb?.nombre || gb?.anio || '');
            },
        },
        {
            title: 'Estudiante',
            dataIndex: ['estudiante', 'nombreCompleto'],
            fixed: 'left',
            ellipsis: true,
            render: (_, record) => (
                <IdentidadCelda
                    codigo={record.estudiante?.codigoEstudiante || null}
                    nombre={(record.estudiante?.nombreCompleto || record.estudiante?.codigoEstudiante || 'Sin nombre').toUpperCase()}
                    accentColor={record.carrera?.colorHex || undefined}
                />
            ),
            sorter: (a, b) =>
                (a.estudiante?.nombreCompleto ?? a.estudiante?.codigoEstudiante ?? '').localeCompare(
                    b.estudiante?.nombreCompleto ?? b.estudiante?.codigoEstudiante ?? ''
                ),
        },
        {
            title: 'Monto a pagar',
            dataIndex: 'monto_obligatorio',
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
                                Base Bs. {base.toFixed(2)}
                            </Text>
                            {desc > 0 ? (
                                <Flex align="center" gap={6}>
                                    <StatusPill
                                        label={`Beca ${becaPct != null ? `${becaPct}%` : ''}`.trim()}
                                        className="cfg-materia-pill cfg-materia-pill--info"
                                    />
                                    <Text type="secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
                                        -Bs. {desc.toFixed(2)}
                                    </Text>
                                </Flex>
                            ) : null}
                            <Text strong style={{ fontSize: 'var(--font-size-base)' }}>
                                Bs. {oblig.toFixed(2)}
                            </Text>
                        </Flex>
                    </Space>
                );
            },
            sorter: (a, b) => (a.monto_obligatorio ?? 0) - (b.monto_obligatorio ?? 0),
        },
        {
            title: 'Detalle del pago',
            dataIndex: ['total_pagado', 'cantidad_pagos'],
            align: 'left',
            render: (_, record) => {
                const t = record.total_pagado ?? 0;
                const n = Number(record.cantidad_pagos ?? 0);
                if (n === 0) {
                    return <TableCell fallback="—">sin pagos</TableCell>;
                }
                return (
                    <TableCell
                        icon={<DollarOutlined />}
                        subtext={`${n} pagos`}
                        fallback="—"
                    >
                        Bs. {Number(t).toFixed(2)}
                    </TableCell>
                );
            },
            sorter: (a, b) => (a.total_pagado ?? 0) - (b.total_pagado ?? 0),
        },
        {
            title: 'Saldo pendiente',
            dataIndex: 'saldo_pendiente',
            align: 'right',
            render: (val, record) => {
                const s = val ?? record.saldo_pendiente ?? 0;
                const num = Number(s);
                return (
                    <TableCell icon={<DollarOutlined />} strong={num > 0}>
                        Bs. {num.toFixed(2)}
                    </TableCell>
                );
            },
            sorter: (a, b) => (a.saldo_pendiente ?? 0) - (b.saldo_pendiente ?? 0),
        },
        {
            title: 'Compromiso',
            dataIndex: 'compromiso',
            render: (compromiso) => {
                if (!compromiso) {
                    return <TableCell fallback="—">{null}</TableCell>;
                }
                return (
                    <TableCell
                        icon={<CalendarOutlined />}
                        subtext={<CompromisoAlertTag compromiso={compromiso} />}
                        fallback="—"
                    >
                        {formatFechaCompromiso(compromiso.fechaCompromiso) === '—'
                            ? 'Sin fecha'
                            : formatFechaCompromiso(compromiso.fechaCompromiso)}
                    </TableCell>
                );
            },
            sorter: (a, b) => compromisoSortValue(a?.compromiso) - compromisoSortValue(b?.compromiso),
        },
        {
            title: 'Estado',
            dataIndex: 'estado',
            width: 130,
            render: (estado, record) => {
                const e = estado ?? record.estado ?? '—';
                return <StatusPill label={e} className={getEstadoAportePillClass(e)} />;
            },
            sorter: (a, b) => (a.estado ?? '').localeCompare(b.estado ?? ''),
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
                    { label: 'Monto a pagar', value: `Base Bs. ${base.toFixed(2)} · Descuento Bs. ${desc.toFixed(2)} · Total Bs. ${oblig.toFixed(2)}` },
                    { label: 'Saldo pendiente', value: `Bs. ${saldo.toFixed(2)}` },
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
