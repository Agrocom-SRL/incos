// src/presentation/pages/Estudiantes/List/List.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Typography, Input, Space, Tag, App, Card } from 'antd';
import { SearchOutlined, UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import apiClient from '@infrastructure/api/client.js';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Search } = Input;

const EstudiantesList = () => {
    const { message } = App.useApp();
    const location = useLocation();
    const [estudiantes, setEstudiantes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState('');

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
        const fullName = `${estudiante.nombres || ''} ${estudiante.apellidoPaterno || ''} ${estudiante.apellidoMaterno || ''}`.toLowerCase();
        const ci = (estudiante.ci || '').toString();
        const email = (estudiante.emailPersonal || '').toLowerCase();
        const celular = (estudiante.celular || '').toString();
        
        return fullName.includes(searchLower) ||
               ci.includes(searchLower) ||
               email.includes(searchLower) ||
               celular.includes(searchLower);
    });

    // Función para formatear nombre completo
    const getFullName = (estudiante) => {
        const parts = [
            estudiante.nombres,
            estudiante.apellidoPaterno,
            estudiante.apellidoMaterno
        ].filter(Boolean);
        return parts.join(' ') || 'Sin nombre';
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
            title: 'CI',
            dataIndex: 'ci',
            key: 'ci',
            width: 140,
            fixed: 'left',
            render: (_, record) => (
                <Space size="small">
                    <UserOutlined />
                    <strong>{getCIFull(record)}</strong>
                </Space>
            ),
            sorter: (a, b) => (a.ci || '').localeCompare(b.ci || ''),
        },
        {
            title: 'Nombre Completo',
            key: 'nombre',
            width: 280,
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
            sorter: (a, b) => getFullName(a).localeCompare(getFullName(b)),
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
                            placeholder="Buscar por nombre, CI, email o celular..."
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
                    />
                </Space>
            </Card>
        </div>
    );
};

export default EstudiantesList;
