import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export const useGestionHorariosAulasState = () => {
    const navigate = useNavigate();

    const breadcrumbItems = useMemo(
        () => [
            { title: 'Inicio', href: '/' },
            { title: 'Institucional', href: '/institucional' },
            { title: 'Gestión de horarios', href: '/institucional/horarios' },
            { title: 'Horarios en aulas' },
        ],
        [],
    );

    const handleVolver = useCallback(() => {
        navigate('/institucional/horarios');
    }, [navigate]);

    return {
        breadcrumbItems,
        handleVolver,
    };
};
