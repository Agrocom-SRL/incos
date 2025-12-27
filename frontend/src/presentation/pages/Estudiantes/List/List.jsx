// src/presentation/pages/Estudiantes/List/List.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Typography, Input, Space, Tag, App, Card, Button } from 'antd';
import { SearchOutlined, UserOutlined, PhoneOutlined, MailOutlined, EditOutlined, CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '@api-client';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Search } = Input;

const EstudiantesList = () => {
    const { message } = App.useApp();
    const location = useLocation();
    const navigate = useNavigate();
    const [estudiantes, setEstudiantes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [registrosIncompletos, setRegistrosIncompletos] = useState({}); // { studentId: { tieneDocumentos, tieneDatosAcademicos } }

    // Función para cargar estudiantes desde la API
    const loadEstudiantes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/v1/estudiantes');
            // La respuesta puede venir en response.data.data o response.data
            const data = response.data?.data || response.data || [];
            setEstudiantes(Array.isArray(data) ? data : []);
        } catch (err) {
            const errorMessage = err.response?.data?.error?.message || 
                                err.message || 
                                'Error al cargar los estudiantes';
            setError(errorMessage);
            message.error(errorMessage);
            setEstudiantes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Función para verificar si un estudiante tiene registro incompleto
    const verificarRegistroIncompleto = useCallback(async (estudianteId) => {
        try {
            // Verificar documentos del estudiante
            let tieneDocumentos = false;
            try {
                const documentosResponse = await apiClient.get(`/v1/estudiantes/${estudianteId}/documentos`);
                tieneDocumentos = (documentosResponse.data?.data?.length > 0) || 
                                 (documentosResponse.data?.length > 0);
            } catch (err) {
                // Si el endpoint retorna 404 o error, asumimos que no hay documentos
                if (err.response?.status === 404) {
                    tieneDocumentos = false;
                } else {
                    console.warn(`Error al verificar documentos del estudiante ${estudianteId}:`, err);
                    tieneDocumentos = false;
                }
            }

            // Verificar datos académicos del estudiante
            // Nota: Necesitamos un endpoint para obtener datos académicos, por ahora asumimos que no hay
            // TODO: Crear endpoint GET /v1/estudiantes/:id/datos-academicos
            let tieneDatosAcademicos = false;
            try {
                const academicosResponse = await apiClient.get(`/v1/estudiantes/${estudianteId}/datos-academicos`);
                tieneDatosAcademicos = !!academicosResponse.data?.data;
            } catch (err) {
                // Si el endpoint no existe (404) o hay error, asumimos que no hay datos académicos
                if (err.response?.status === 404) {
                    tieneDatosAcademicos = false;
                } else {
                    console.warn(`Error al verificar datos académicos del estudiante ${estudianteId}:`, err);
                    tieneDatosAcademicos = false;
                }
            }

            return {
                tieneDocumentos,
                tieneDatosAcademicos,
                incompleto: !tieneDocumentos || !tieneDatosAcademicos
            };
        } catch (err) {
            console.error(`Error al verificar registro del estudiante ${estudianteId}:`, err);
            // Si hay error, asumimos que está incompleto para mostrar el botón
            return {
                tieneDocumentos: false,
                tieneDatosAcademicos: false,
                incompleto: true
            };
        }
    }, []);

    // Verificar registros incompletos después de cargar estudiantes
    useEffect(() => {
        const verificarTodos = async () => {
            const incompletos = {};
            for (const estudiante of estudiantes) {
                if (estudiante.id) {
                    const estado = await verificarRegistroIncompleto(estudiante.id);
                    incompletos[estudiante.id] = estado;
                }
            }
            setRegistrosIncompletos(incompletos);
        };

        if (estudiantes.length > 0) {
            verificarTodos();
        }
    }, [estudiantes, verificarRegistroIncompleto]);

    // Cargar estudiantes al montar el componente
    useEffect(() => {
        loadEstudiantes();
    }, [loadEstudiantes]);

    // Recargar cuando la página recupera el foco (cuando el usuario vuelve a la pestaña)
    useEffect(() => {
        const handleFocus = () => {
            if (location.pathname === '/estudiantes/listar' || location.pathname === '/estudiantes') {
                loadEstudiantes();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [location.pathname, loadEstudiantes]);

    // Filtrar estudiantes según el texto de búsqueda
    const filteredEstudiantes = estudiantes.filter(estudiante => {
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
        <div style={{ 
            maxWidth: '100%',
            width: '100%'
        }}>
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
        </div>
    );
};

export default EstudiantesList;
