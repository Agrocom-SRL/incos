/**
 * Hook: usePagosRegistrarData
 * 
 * Single Responsibility: Gestionar el estado específico para la feature de registro de pagos
 * 
 * Clean Architecture:
 * - Application Layer: Hook que gestiona el estado del contexto orquestando hooks de feature
 * - Similar a useInscripcionesData pero específico para la feature "registro de pagos"
 * 
 * Este hook:
 * - Orquesta todos los hooks de feature (paymentAccounts, authorizedBanks, paymentMethods, contributionConfigurations)
 * - Gestiona el estado del formulario de registro de pago
 * - Maneja la lógica de validación
 * - Coordina la creación de pagos
 * - Retorna el valor completo del contexto para el Provider
 * 
 * Ventajas:
 * - Separación de responsabilidades: Provider solo expone, hook gestiona estado
 * - Testeable: Se puede testear el hook independientemente
 * - Reutilizable: Se puede usar el hook sin el Provider si es necesario
 * - Mantenible: Toda la lógica está centralizada en un solo lugar
 * 
 * Nota: Este hook GESTIONA el estado del contexto (para el Provider).
 * Para CONSUMIR el contexto, usa usePagosRegistrarContext en context/.
 */

import { useState, useCallback, useMemo } from 'react';
import {
    usePagosRegistrarPaymentAccounts,
    usePagosRegistrarAuthorizedBanks,
    usePagosRegistrarPaymentMethods,
    usePagosRegistrarContributionConfigurations,
} from '../features';
import { useGetStudentScholarships } from '@application-estudiantes/hooks/api';
import { useCasesFactory } from '@container';

/**
 * Hook que gestiona el estado del contexto de registro de pagos
 * 
 * @param {string|number|null} studentId - ID del estudiante para obtener sus becas
 * @returns {Object} Objeto con todo el contexto de registro de pagos
 */
export const usePagosRegistrarData = (studentId = null) => {
    // 1. Hooks de feature
    const paymentAccountsData = usePagosRegistrarPaymentAccounts();
    const authorizedBanksData = usePagosRegistrarAuthorizedBanks();
    const paymentMethodsData = usePagosRegistrarPaymentMethods();
    const contributionConfigurationsData = usePagosRegistrarContributionConfigurations();

    // 1.1. Hook para obtener becas del estudiante usando el endpoint específico
    const { 
        scholarships, 
        catalogs, 
        loading: loadingScholarships, 
        error: errorScholarships 
    } = useGetStudentScholarships(studentId);

    // 1.2. Estado para registro de pago (no usamos el hook porque necesitamos preservar el error completo)
    const [aporteVoluntario, setAporteVoluntario] = useState(null);
    const [loadingRegister, setLoadingRegister] = useState(false);
    const [errorRegister, setErrorRegister] = useState(null);

    // 1.3. Obtener beca activa del estudiante
    const becaActiva = useMemo(() => {
        if (!scholarships || !Array.isArray(scholarships) || scholarships.length === 0) {
            return null;
        }
        
        // Buscar beca aplicable para descuento (ACTIVA o PENDIENTE que tenga porcentaje)
        // Para el cálculo del pago, consideramos becas ACTIVA o PENDIENTE que tengan porcentaje
        const activa = scholarships.find(
            (beca) => {
                const stateValue = beca.state || beca.estado;
                if (!stateValue) return false;
                
                // Normalizar a mayúsculas para comparar
                const normalizedState = String(stateValue).toUpperCase();
                
                // Aceptar becas ACTIVA o PENDIENTE (las PENDIENTE también pueden aplicar descuento)
                const tieneEstadoValido = normalizedState === 'ACTIVA' || normalizedState === 'ACTIVE' || normalizedState === 'PENDIENTE';
                
                // Verificar que tenga porcentaje de descuento
                const tienePorcentaje = beca.scholarshipPercentage || beca.porcentaje;
                
                return tieneEstadoValido && tienePorcentaje;
            }
        ) || null;
        
        return activa;
    }, [scholarships]);

    // 2. Estado del formulario
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 2.1 Combinar loading de todos los hooks de API
    const combinedLoading = paymentAccountsData.loading || 
                           authorizedBanksData.loading || 
                           paymentMethodsData.loading || 
                           contributionConfigurationsData.loading || 
                           loadingScholarships ||
                           loadingRegister ||
                           loading;
    
    // 2.2 Combinar errores de todos los hooks de API (priorizar el primero encontrado)
    const combinedError = error || 
                         errorRegister ||
                         errorScholarships ||
                         paymentAccountsData.error || 
                         authorizedBanksData.error || 
                         paymentMethodsData.error || 
                         contributionConfigurationsData.error;

    /**
     * Actualiza un campo del formulario
     */
    const updateFormData = useCallback((field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    /**
     * Resetea el formulario
     */
    const resetForm = useCallback(() => {
        setFormData({});
        setError(null);
    }, []);

    /**
     * Establece un error
     */
    const setFormError = useCallback((errorMessage) => {
        setError(errorMessage);
    }, []);

    // 3. Callbacks memoizados para selección (similares a useInscripcionNuevaData)
    const handleSelectCuentaPago = useCallback((cuentaPago) => {
        if (cuentaPago && paymentAccountsData.onSelectCuentaPago) {
            paymentAccountsData.onSelectCuentaPago(cuentaPago);
        }
    }, [paymentAccountsData.onSelectCuentaPago]);

    const handleSelectBanco = useCallback((banco) => {
        if (banco && authorizedBanksData.onSelectBanco) {
            authorizedBanksData.onSelectBanco(banco);
        }
    }, [authorizedBanksData.onSelectBanco]);

    const handleSelectMetodoPago = useCallback((metodoPago) => {
        if (metodoPago && paymentMethodsData.onSelectMetodoPago) {
            paymentMethodsData.onSelectMetodoPago(metodoPago);
        }
    }, [paymentMethodsData.onSelectMetodoPago]);

    const handleSelectConfiguracion = useCallback((configuracion) => {
        if (configuracion && contributionConfigurationsData.onSelectConfiguracion) {
            contributionConfigurationsData.onSelectConfiguracion(configuracion);
        }
    }, [contributionConfigurationsData.onSelectConfiguracion]);

    // 4. Función para registrar el pago (llama directamente al use case para preservar el error completo)
    const handleRegistrarPago = useCallback(async (pagoData) => {
        try {
            setLoading(true);
            setError(null);
            setLoadingRegister(true);
            setErrorRegister(null);
            
            // Preparar datos para el backend (snake_case). amount = monto de esta cuota (lo que se muestra en "Saldo a Pagar").
            const dataToSend = {
                student_id: pagoData.studentId || studentId,
                amount: pagoData.amount != null ? Number(pagoData.amount) : undefined,
                payment_method_id: pagoData.paymentMethodId,
                payment_account_id: pagoData.paymentAccountId || null,
                payment_date: pagoData.paymentDate,
                transaction_number: pagoData.transactionNumber || null, // Opcional, independiente del código de comprobante
                codigo_comprobante: pagoData.codigoComprobante || null, // Requerido para QR/TRANSFERENCIA/DEPOSITO, independiente de transaction_number
                descripcion: pagoData.descripcion || null, // Opcional
                documentoRespaldo: pagoData.documentoRespaldo || null, // Archivo de documento de respaldo
            };

            // Llamar directamente al use case para preservar la estructura completa del error
            const useCaseInstance = useCasesFactory.registrarAporteVoluntario();
            if (!useCaseInstance) {
                throw new Error('Use Case registrarAporteVoluntario no encontrado');
            }

            const result = await useCaseInstance.ejecutar(dataToSend);
            
            // Debug: Log del resultado para ver qué está llegando
            console.log('[usePagosRegistrarData] Resultado del registro:', result);
            
            if (!result || !result.success) {
                // Preservar la estructura completa del error para que el componente pueda extraer el mensaje
                // El error puede ser un objeto { code, message, details } o un string
                const errorToReturn = result && result.error ? result.error : 'Error al registrar el pago';
                
                // Para setError, extraer el mensaje si es un objeto
                let errorMessage = 'Error al registrar el pago';
                if (errorToReturn && typeof errorToReturn === 'object' && errorToReturn.message) {
                    errorMessage = errorToReturn.message;
                } else if (typeof errorToReturn === 'string') {
                    errorMessage = errorToReturn;
                }
                
                setError(errorMessage);
                setErrorRegister(errorMessage);
                // Retornar el error completo (objeto o string) para que el componente pueda manejarlo
                return { success: false, error: errorToReturn };
            }

            // Si hay éxito, actualizar el estado
            setAporteVoluntario(result.data);
            return { success: true, data: result.data };
        } catch (err) {
            const errorMsg = err.message || 'Error al registrar el pago';
            setError(errorMsg);
            setErrorRegister(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
            setLoadingRegister(false);
        }
    }, [studentId, setLoading, setError]);

    // 5. Componer value final del contexto (similar a useInscripcionNuevaData)
    return useMemo(() => ({
        // Estado del formulario
        formData,
        loading: combinedLoading,
        error: combinedError,

        // Datos de becas del estudiante
        becaActiva,
        scholarships,
        catalogs,
        loadingScholarships,

        // Métodos del formulario
        updateFormData,
        resetForm,
        setLoading,
        setFormError,
        registrarPago: handleRegistrarPago,

        // Datos del pago registrado
        pagoRegistrado: aporteVoluntario,

        // Cuentas de pago
        cuentasPago: {
            cuentasPago: paymentAccountsData.cuentasPago,
            loading: paymentAccountsData.loading,
            error: paymentAccountsData.error,
            selectedCuentaPago: paymentAccountsData.selectedCuentaPago,
            onSelectCuentaPago: handleSelectCuentaPago,
            refetch: paymentAccountsData.refetch,
        },

        // Bancos autorizados
        bancosAutorizados: {
            bancosAutorizados: authorizedBanksData.bancosAutorizados,
            loading: authorizedBanksData.loading,
            error: authorizedBanksData.error,
            selectedBanco: authorizedBanksData.selectedBanco,
            onSelectBanco: handleSelectBanco,
            refetch: authorizedBanksData.refetch,
        },

        // Métodos de pago
        metodosPago: {
            metodosPago: paymentMethodsData.metodosPago,
            loading: paymentMethodsData.loading,
            error: paymentMethodsData.error,
            selectedMetodoPago: paymentMethodsData.selectedMetodoPago,
            onSelectMetodoPago: handleSelectMetodoPago,
            refetch: paymentMethodsData.refetch,
        },

        // Configuraciones de aportes
        configuracionAportes: {
            configuracionAportes: contributionConfigurationsData.configuracionAportes,
            loading: contributionConfigurationsData.loading,
            error: contributionConfigurationsData.error,
            selectedConfiguracion: contributionConfigurationsData.selectedConfiguracion,
            onSelectConfiguracion: handleSelectConfiguracion,
            refetch: contributionConfigurationsData.refetch,
        },
    }), [
        formData,
        combinedLoading,
        combinedError,
        becaActiva,
        scholarships,
        catalogs,
        loadingScholarships,
        updateFormData,
        resetForm,
        setFormError,
        handleRegistrarPago,
        aporteVoluntario,
        paymentAccountsData.cuentasPago,
        paymentAccountsData.loading,
        paymentAccountsData.error,
        paymentAccountsData.selectedCuentaPago,
        paymentAccountsData.refetch,
        handleSelectCuentaPago,
        authorizedBanksData.bancosAutorizados,
        authorizedBanksData.loading,
        authorizedBanksData.error,
        authorizedBanksData.selectedBanco,
        authorizedBanksData.refetch,
        handleSelectBanco,
        paymentMethodsData.metodosPago,
        paymentMethodsData.loading,
        paymentMethodsData.error,
        paymentMethodsData.selectedMetodoPago,
        paymentMethodsData.refetch,
        handleSelectMetodoPago,
        contributionConfigurationsData.configuracionAportes,
        contributionConfigurationsData.loading,
        contributionConfigurationsData.error,
        contributionConfigurationsData.selectedConfiguracion,
        contributionConfigurationsData.refetch,
        handleSelectConfiguracion,
    ]);
};
