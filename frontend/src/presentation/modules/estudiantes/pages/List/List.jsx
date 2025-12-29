// src/presentation/modules/estudiantes/pages/List/List.jsx
/**
 * EstudiantesList - Página para listar estudiantes
 * 
 * Single Responsibility: Solo renderizar la UI de la lista de estudiantes
 * 
 * Esta es una página pura de React y Ant Design que:
 * - No contiene lógica de negocio
 * - Obtiene datos del StudentProvider mediante useStudentContext
 * - Solo maneja lógica de presentación (filtrado local, formateo)
 */

import React, { useState, useEffect } from 'react';
import { Table, Typography, Input, Space, Tag, App, Card, Button, Spin } from 'antd';
import { SearchOutlined, UserOutlined, PhoneOutlined, MailOutlined, EditOutlined, CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useStudentContext } from '@application-estudiantes/hooks';
import { PageTemplate } from '@templates';

const { Title } = Typography;
const { Search } = Input;

const EstudiantesList = () => {
    const { message } = App.useApp();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Obtener datos del contexto (toda la lógica está en el Provider)
    const {
        estudiantesList = [],
        registrosIncompletos = {},
        loadingList: loading,
        listError: error,
        refetchList,
    } = useStudentContext();
    
    // Estado local solo para UI (búsqueda)
    const [searchText, setSearchText] = useState('');

    // Recargar cuando la página recupera el foco (cuando el usuario vuelve a la pestaña)
    useEffect(() => {
        const handleFocus = () => {
            if (location.pathname === '/estudiantes') {
                refetchList();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [location.pathname, refetchList]);

    // Mostrar errores si existen
    useEffect(() => {
        if (error) {
            message.error(error);
        }
    }, [error, message]);

    // Filtrar estudiantes según el texto de búsqueda (filtrado local)
    const filteredEstudiantes = estudiantesList.filter(estudiante => {
        if (!searchText) return true;
        const searchLower = searchText.toLowerCase();
        // Buscar en nombre completo (apellidos, nombres)
        const fullName = getFullName(estudiante).toLowerCase();
        // Buscar en código de estudiante
        const codigo = (estudiante.codigoEstudiante || '').toLowerCase();
        const ci = (estudiante.ci || '').toString();
        const email = (estudiante.emailPersonal || '').toLowerCase();
        const celular = (estudiante.celular || '').toString();

        return fullName.includes(searchLower) ||
            codigo.includes(searchLower) ||
            ci.includes(searchLower) ||
            email.includes(searchLower) ||
            celular.includes(searchLower);
    });

    // Función para formatear nombre completo (apellidos primero, luego nombres)
    const getFullName = (estudiante) => {
        const apellidos = [
            estudiante.apellidoPaterno,
            estudiante.apellidoMaterno
        ].filter(Boolean).join(' ');
        const nombres = estudiante.nombres || '';

        if (apellidos && nombres) {
            return `${apellidos}, ${nombres}`;
        } else if (apellidos) {
            return apellidos;
        } else if (nombres) {
            return nombres;
        }
        return 'Sin nombre';
    };

    // Función para formatear CI completo
    const getCIFull = (estudiante) => {
        if (!estudiante.ci) return 'N/A';
        return estudiante.expedicion
            ? `${estudiante.ci} ${estudiante.expedicion}`
            : estudiante.ci;
    };

    // Función para formatear fecha
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return dayjs(date).format('DD/MM/YYYY');
    };

    // Función para calcular edad
    const calculateAge = (fechaNacimiento) => {
        if (!fechaNacimiento) return null;
        return dayjs().diff(dayjs(fechaNacimiento), 'year');
    };

    // Mostrar loading mientras se cargan los datos
    if (loading && estudiantesList.length === 0) {
        return (
            <PageTemplate>
                <Spin size="large" style={{ display: 'block', textAlign: 'center', padding: '50px' }} />
            </PageTemplate>
        );
    }

    // Columnas de la tabla
    const columns = [
        {
            title: 'Código de Estudiante',
            dataIndex: 'codigoEstudiante',
            key: 'codigoEstudiante',
            width: 160,
            fixed: 'left',
            render: (codigo) => (
                <Space size="small">
                    <strong style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                        {codigo || 'N/A'}
                    </strong>
                </Space>
            ),
            sorter: (a, b) => {
                // Ordenar por código: primero por año, luego por correlativo
                const codigoA = a.codigoEstudiante || '';
                const codigoB = b.codigoEstudiante || '';
                return codigoA.localeCompare(codigoB, undefined, { numeric: true, sensitivity: 'base' });
            },
            defaultSortOrder: 'ascend',
        },
        {
            title: 'Nombre Completo',
            key: 'nombre',
            width: 300,
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{getFullName(record)}</div>
                    {record.genero && (
                        <Tag color="blue" style={{ marginTop: 4, fontSize: '11px' }}>
                            {record.genero}
                        </Tag>
                    )}
                </div>
            ),
            sorter: (a, b) => {
                // Ordenar por apellidos primero, luego nombres
                const nombreA = getFullName(a);
                const nombreB = getFullName(b);
                return nombreA.localeCompare(nombreB);
            },
        },
        {
            title: 'CI',
            dataIndex: 'ci',
            key: 'ci',
            width: 140,
            render: (_, record) => (
                <Space size="small">
                    <UserOutlined />
                    <strong>{getCIFull(record)}</strong>
                </Space>
            ),
            sorter: (a, b) => (a.ci || '').localeCompare(b.ci || ''),
        },
        {
            title: 'Fecha de Nacimiento',
            dataIndex: 'fechaNacimiento',
            key: 'fechaNacimiento',
            width: 160,
            render: (fecha) => {
                const edad = calculateAge(fecha);
                return (
                    <div>
                        <div>{formatDate(fecha)}</div>
                        {edad !== null && (
                            <Tag color="cyan" style={{ marginTop: 4, fontSize: '11px' }}>
                                {edad} años
                            </Tag>
                        )}
                    </div>
                );
            },
            sorter: (a, b) => {
                const dateA = a.fechaNacimiento ? dayjs(a.fechaNacimiento).valueOf() : 0;
                const dateB = b.fechaNacimiento ? dayjs(b.fechaNacimiento).valueOf() : 0;
                return dateA - dateB;
            },
        },
        {
            title: 'Contacto',
            key: 'contacto',
            width: 260,
            render: (_, record) => (
                <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                    {record.emailPersonal && (
                        <Space size="small" style={{ fontSize: '12px' }}>
                            <MailOutlined />
                            <span style={{ fontSize: '12px' }}>{record.emailPersonal}</span>
                        </Space>
                    )}
                    {record.celular && (
                        <Space size="small" style={{ fontSize: '12px' }}>
                            <PhoneOutlined />
                            <span style={{ fontSize: '12px' }}>{record.celular}</span>
                        </Space>
                    )}
                </Space>
            ),
        },
        {
            title: 'Información Adicional',
            key: 'info',
            width: 200,
            render: (_, record) => (
                <Space orientation="vertical" size={4}>
                    {record.tipoSangre && (
                        <Tag color="red" style={{ fontSize: '11px' }}>Sangre: {record.tipoSangre}</Tag>
                    )}
                    {record.nacionalidad && (
                        <Tag style={{ fontSize: '11px' }}>{record.nacionalidad}</Tag>
                    )}
                    {record.tieneDiscapacidad && (
                        <Tag color="orange" style={{ fontSize: '11px' }}>Con discapacidad</Tag>
                    )}
                </Space>
            ),
        },
        {
            title: 'Estado',
            key: 'estado',
            width: 150,
            fixed: 'right',
            render: (_, record) => {
                const estado = registrosIncompletos[record.id];
                if (!estado) {
                    return <Tag color="default">Verificando...</Tag>;
                }
                if (estado.incompleto) {
                    return (
                        <Tag color="warning" icon={<EditOutlined />}>
                            Registro Incompleto
                        </Tag>
                    );
                }
                return (
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                        Completo
                    </Tag>
                );
            },
        },
        {
            title: 'Acciones',
            key: 'acciones',
            width: 180,
            fixed: 'right',
            render: (_, record) => {
                const estado = registrosIncompletos[record.id];
                const tieneRegistroIncompleto = estado?.incompleto;
                const tieneRegistroCompleto = estado && !estado.incompleto;

                return (
                    <Space>
                        {tieneRegistroIncompleto && (
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => navigate(`/estudiantes/registrar?estudianteId=${record.id}`)}
                                size="small"
                            >
                                Completar Registro
                            </Button>
                        )}
                        {tieneRegistroCompleto && (
                            <Button
                                type="default"
                                icon={<EyeOutlined />}
                                onClick={() => navigate(`/estudiantes/registrar?estudianteId=${record.id}&view=true`)}
                                size="small"
                                style={{
                                    backgroundColor: '#52c41a',
                                    borderColor: '#52c41a',
                                    color: '#fff'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#73d13d';
                                    e.currentTarget.style.borderColor = '#73d13d';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#52c41a';
                                    e.currentTarget.style.borderColor = '#52c41a';
                                }}
                            >
                                Ver Registro
                            </Button>
                        )}
                    </Space>
                );
            },
        },
    ];

    return (
        <PageTemplate>
            <Card>
                <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: '16px',
                        marginBottom: '8px'
                    }}>
                        <Title level={2} style={{ margin: 0 }}>
                            Lista de Estudiantes
                        </Title>
                        <Search
                            placeholder="Buscar por código, nombre, CI, email o celular..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="middle"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ minWidth: '300px', maxWidth: '400px', flex: '1' }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '10px 12px',
                            background: '#fff2f0',
                            border: '1px solid #ffccc7',
                            borderRadius: '4px',
                            color: '#cf1322',
                            marginBottom: '8px'
                        }}>
                            {error}
                        </div>
                    )}

                    <Table
                        columns={columns}
                        dataSource={filteredEstudiantes}
                        rowKey={(record) => record.id || record.ci || Math.random()}
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total: ${total} estudiantes`,
                            pageSizeOptions: ['10', '20', '50', '100'],
                        }}
                        scroll={{ x: 'max-content' }}
                        size="middle"
                        defaultSort={{
                            field: 'codigoEstudiante',
                            order: 'ascend',
                        }}
                    />
                </Space>
            </Card>
        </PageTemplate>
    );
};

export default EstudiantesList;
