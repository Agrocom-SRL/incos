/**
 * Hook: useStudentDetail (Global State)
 *
 * Single Responsibility: Lógica y estado del detalle de un estudiante (sin UI).
 * Application Layer: solo datos, handlers y estado derivado (strings, arrays, callbacks).
 *
 * Clasificación: 2. GLOBAL STATE - Gestión de estado global/compartido del detalle.
 * - Usa useGetStudentById (API) + mapEstudianteDetail (mapeo)
 * - Expone handlers y datos derivados para que la capa Presentation los use y dibuje la UI
 * - No importa ni devuelve componentes React (Card, Button, etc.)
 *
 * @param {string|number|null} studentId - ID del estudiante a cargar
 * @returns {{ student, loading, error, getStudentById, refetch, studentData, guardians, disabilities, origins, documentDeliveries, scholarships, inscripcion, breadcrumbItems, avatarInitials, profileSubtitle, handleRegistrarPago, handleGenerateActaCompromiso, handleDownloadActaCompromiso, handleVerInscripcion, handleNuevaInscripcion, tieneDocumentosFaltantesFlag, actaCompromisoData, loadingActa, hasInscripcion }}
 */

import { useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetStudentById } from '@application-estudiantes/hooks/api';
import { useGenerateActaCompromiso, useGenerateDeclaracionJurada } from '../features';
import { usePagosContextOptional, useEstadoAporteRegistro } from '@application-pagos/hooks';
import { mapEstudianteDetail } from '@application-estudiantes/mappers';
import { downloadFile } from '@application/utils';
import { App } from 'antd';

export const useStudentDetail = (studentId) => {
  const navigate = useNavigate();
  const { message } = App.useApp();

  const { student: studentRaw, loading, error, getStudentById, refetch } = useGetStudentById();
  const { generateActaCompromiso, loading: loadingActa } = useGenerateActaCompromiso();
  const { generateDeclaracionJurada, loading: loadingDeclaracion } = useGenerateDeclaracionJurada();
  const pagosContext = usePagosContextOptional();
  const { estadoAporte, loading: loadingEstadoAporte } = useEstadoAporteRegistro(studentId || null, null);

  useEffect(() => {
    if (studentId) {
      getStudentById(studentId);
    }
  }, [studentId, getStudentById]);

  const student = studentRaw ? mapEstudianteDetail(studentRaw) : null;

  const studentData = student?.student;
  const guardians = student?.guardians;
  const disabilities = student?.disabilities;
  const origins = student?.origins;
  const documentDeliveries = student?.documentDeliveries;
  const scholarships = student?.scholarships;
  const inscripcion = student?.inscripcion;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Estudiantes', href: '/estudiantes' },
      { title: 'Detalle del Estudiante' },
    ],
    []
  );

  const handleRegistrarPago = useCallback(() => {
    if (!studentId) {
      message.warning('ID de estudiante no disponible');
      return;
    }
    if (!loadingEstadoAporte && estadoAporte?.saldo_pendiente === 0 && estadoAporte?.cabecera?.id) {
      navigate(`/pagos/${estadoAporte.cabecera.id}`, { state: { studentId } });
      return;
    }
    if (pagosContext?.pagos && Array.isArray(pagosContext.pagos)) {
      const pagosEstudiante = pagosContext.pagos.filter((pago) => {
        const pagoStudentId =
          pago.estudiante?.id ||
          pago.student?.id ||
          pago.estudianteId ||
          pago.studentId ||
          pago.estudiante_id ||
          pago.student_id;
        return Number(pagoStudentId) === Number(studentId);
      });
      if (pagosEstudiante.length > 0) {
        const pagoMasReciente = pagosEstudiante.sort((a, b) => {
          const idA = a.id || 0;
          const idB = b.id || 0;
          if (idA !== idB) return idB - idA;
          const fechaA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const fechaB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return fechaB - fechaA;
        })[0];
        const pagoId = pagoMasReciente.id;
        if (pagoId) {
          navigate(`/pagos/${pagoId}`, { state: { studentId } });
          return;
        }
      }
    }
    navigate('/pagos/registrar', { state: { studentId } });
  }, [navigate, studentId, pagosContext, message, loadingEstadoAporte, estadoAporte]);

  const handleGenerateActaCompromiso = useCallback(async () => {
    if (!studentId) {
      message.error('ID de estudiante no disponible');
      return;
    }
    const result = await generateActaCompromiso(studentId);
    if (!result.success) {
      let errorMessage = 'Error al generar el acta de compromiso';
      if (result.error) {
        if (typeof result.error === 'string') errorMessage = result.error;
        else if (result.error.message) errorMessage = result.error.message;
        else if (result.error.code) errorMessage = `${result.error.code}: ${result.error.message || 'Error desconocido'}`;
      } else if (result.message) errorMessage = result.message;
      message.error(errorMessage);
    } else {
      message.success('Acta de compromiso generada y descargada correctamente');
    }
  }, [studentId, generateActaCompromiso, message]);

  const handleGenerateDeclaracionJurada = useCallback(async () => {
    if (!studentId) {
      message.error('ID de estudiante no disponible');
      return;
    }
    const tipoAdmision = student?.tipoAdmision || null;
    const result = await generateDeclaracionJurada(studentId, { tipoAdmision });
    if (!result.success) {
      let errorMessage = 'Error al generar la declaración jurada';
      if (result.error) {
        if (typeof result.error === 'string') errorMessage = result.error;
        else if (result.error.message) errorMessage = result.error.message;
        else if (result.error.code) {
          errorMessage = `${result.error.code}: ${result.error.message || 'Error desconocido'}`;
        }
      } else if (result.message) errorMessage = result.message;
      message.error(errorMessage);
    } else {
      message.success('Declaración jurada generada y descargada correctamente');
    }
  }, [studentId, generateDeclaracionJurada, message]);

  const handleDownloadActaCompromiso = useCallback(() => {
    const actaCompromisoData = student?.actaCompromiso;
    if (actaCompromisoData) {
      try {
        downloadFile(actaCompromisoData.filePath, actaCompromisoData.fileName);
      } catch (err) {
        console.error('Error al descargar el acta de compromiso:', err);
        message.error('Error al descargar el acta de compromiso');
      }
    }
  }, [student, message]);

  const handleVerInscripcion = useCallback(() => {
    if (student?.inscripcion?.enrollment?.id) {
      navigate(`/inscripciones/${student.inscripcion.enrollment.id}`, { state: { studentId } });
    }
  }, [navigate, student, studentId]);

  const handleNuevaInscripcion = useCallback(() => {
    const enrollmentId = student?.inscripcion?.enrollment?.id;
    if (enrollmentId) {
      navigate(`/inscripciones/${enrollmentId}`, { state: { studentId } });
    } else {
      navigate('/inscripciones/nueva', { state: { studentId } });
    }
  }, [navigate, studentId, student?.inscripcion?.enrollment?.id]);

  const tieneDocumentosFaltantesFlag = student?.tieneDocumentosFaltantes === true;
  const actaCompromisoData = student?.actaCompromiso;
  const hasInscripcion = !!student?.inscripcion?.enrollment?.id;

  const avatarInitials = useMemo(() => {
    const name = studentData?.nombreCompleto || studentData?.nombres || '';
    if (!name.trim()) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [studentData?.nombreCompleto, studentData?.nombres]);

  const profileSubtitle = useMemo(() => {
    if (inscripcion?.career?.name && inscripcion?.management?.name) {
      const code = inscripcion.career.code ? `${inscripcion.career.code} - ` : '';
      return `${code}${inscripcion.career.name} · ${inscripcion.management.name} (${inscripcion.management.year || ''})`;
    }
    if (inscripcion?.career?.name) return inscripcion.career.name;
    return 'Estudiante';
  }, [inscripcion]);

  return {
    student,
    loading,
    error,
    getStudentById,
    refetch: () => refetch(studentId),
    studentData,
    guardians,
    disabilities,
    origins,
    documentDeliveries,
    scholarships,
    inscripcion,
    breadcrumbItems,
    avatarInitials,
    profileSubtitle,
    handleRegistrarPago,
    handleGenerateActaCompromiso,
    handleGenerateDeclaracionJurada,
    handleDownloadActaCompromiso,
    handleVerInscripcion,
    handleNuevaInscripcion,
    tieneDocumentosFaltantesFlag,
    actaCompromisoData,
    loadingActa,
    loadingDeclaracion,
    hasInscripcion,
  };
};
