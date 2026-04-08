/**
 * tableColumns - Configuración de columnas para la tabla de pagos de aportes (vista_pago_aporte_listado)
 *
 * Campos según vista: estudiante, gestion, monto_base, descuento_beca, monto_obligatorio,
 * total_pagado, cantidad_pagos, saldo_pendiente, estado.
 * Los ítems llegan con estudiante.nombreCompleto desde pagosListMapper.
 */

import { UserOutlined, CalendarOutlined, DollarOutlined, NumberOutlined } from '@ant-design/icons';
import { Tag, Space, Flex } from 'antd';
import { TableCell } from '@molecules';
import { Text } from '@atoms';
import PagoTableActions from './PagoTableActions';

/**
 * Crea las columnas de la tabla de pagos de aportes.
 *
 * @param {Function} navigate - Función de navegación de react-router
 * @param {Function} refetch - Función para recargar con params (page, limit, search, sort, gestion_id, estudiante_id, estado)
 * @param {Function} [deletePago] - Función para eliminar pago
 * @param {Object} [options] - viewNavigateState: estado al abrir detalle desde la tabla (ej. menú Matrícula > Aportes)
 */
export const createPagosTableColumns = (navigate, refetch = null, deletePago = null, options = {}) => {
    const { viewNavigateState } = options;
    return [
        {
            title: 'Gestión',
            dataIndex: 'gestion',
            render: (gestion, record) => {
                const g = gestion || record.management;
                const label = g ? (g.nombre || g.anio || String(g.id)) : 'N/A';
                return (
                    <TableCell icon={<CalendarOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }}>
                        {label}
                    </TableCell>
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
            ellipsis: true,
            render: (_, record) => (
                <TableCell
                    strong
                    icon={<UserOutlined />}
                    subtext={record.estudiante?.codigoEstudiante ?? '—'}
                    fallback="Sin nombre"
                >
                    {record.estudiante?.nombreCompleto ?? record.estudiante?.codigoEstudiante ?? 'Sin nombre'}
                </TableCell>
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
                return (
                    <Space align="start" size={8}>
                        <DollarOutlined style={{ marginTop: 4 }} />
                        <Flex vertical align="flex-end" gap={2}>
                            <Text type="secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
                                Base Bs. {base.toFixed(2)}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
                                Descuento Bs. {desc.toFixed(2)}
                            </Text>
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
            title: 'Estado',
            dataIndex: 'estado',
            render: (estado, record) => {
                const e = estado ?? record.estado ?? 'N/A';
                const color = e === 'CANCELADO' ? 'default' : e === 'PENDIENTE' ? 'warning' : 'success';
                return <Tag color={color}>{e}</Tag>;
            },
            sorter: (a, b) => (a.estado ?? '').localeCompare(b.estado ?? ''),
        },
        {
            title: 'Acciones',
            key: 'acciones',
            fixed: 'right',
            width: 80,
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
                        permisos={{
                            ver: [
                                { codigo: 'finanzas.pago.ver', accion: 'DETALLE' },
                                { codigo: 'matricula.pago.aporte.ver', accion: 'DETALLE' },
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
