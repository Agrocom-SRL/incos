/**
 * EstudianteFichaSection — ficha completa SOLO LECTURA del estudiante autenticado,
 * embebida en "Mi perfil". Sin botones de edición, PDF ni pestañas de acceso.
 *
 * Recibe los datos ya cargados (`misDatos`) desde el hook de la página; no hace
 * fetch (organismo presentacional). Shape: GET /estudiantes/mis-datos.
 */

import { BookOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Empty, Spin } from 'antd';
import { DetailInfoCard } from '@molecules';
import { DetailField } from '@atoms';
import { buildFullName } from '@application/utils/formatters';

const valor = (v) => (v == null || v === '' ? '—' : v);

const ciCompleto = (ci, expedition) =>
  [ci, expedition].filter(Boolean).join(' ') || '—';

const residencia = (student) =>
  [
    student?.residenceMunicipalityName,
    student?.residenceProvinceName,
    student?.residenceDepartmentName,
  ]
    .filter(Boolean)
    .join(', ') || '—';

/** Etiqueta de un dato académico que puede venir como objeto {code,name} o id. */
const etiquetaAcademica = (obj, idFallback) => {
  if (obj && (obj.name || obj.nombre || obj.code)) {
    const code = obj.code || obj.codigo;
    const name = obj.name || obj.nombre;
    return code && name ? `${code} — ${name}` : name || code;
  }
  return idFallback != null ? `ID: ${idFallback}` : '—';
};

const GuardianCard = ({ guardian }) => {
  const nombre = buildFullName(
    guardian.firstName || guardian.nombres,
    guardian.lastName || guardian.apellidoPaterno || guardian.apellidos,
    guardian.motherLastName || guardian.apellidoMaterno,
    'Contacto',
  );
  const parentesco =
    guardian.relationshipTypeName || guardian.parentesco || guardian.relationshipTypeId;
  const celular = guardian.cellphone1 || guardian.celular1 || guardian.celular;
  const email = guardian.email || guardian.correo;

  return (
    <DetailInfoCard title={nombre} icon={<TeamOutlined />} cols={2}>
      <DetailField label="Parentesco">{valor(parentesco)}</DetailField>
      <DetailField label="Celular">{valor(celular)}</DetailField>
      {email ? <DetailField label="Correo">{email}</DetailField> : null}
    </DetailInfoCard>
  );
};

const EstudianteFichaSection = ({ misDatos, loading = false, error = null }) => {
  if (loading) {
    return (
      <Spin spinning tip="Cargando tus datos…">
        <div className="sd-spin-body" style={{ minHeight: 120 }} aria-hidden />
      </Spin>
    );
  }

  if (error) {
    return <Alert type="warning" showIcon title="No se pudieron cargar tus datos" description={error} />;
  }

  if (!misDatos?.student) {
    return <Empty description="No se encontró tu ficha de estudiante." />;
  }

  const { student, guardians = [], academicData, inscripcion } = misDatos;

  const nombreCompleto = buildFullName(
    student.firstName,
    student.lastName,
    student.motherLastName,
    '—',
  );

  const tipoAdmision =
    academicData?.tipoAdmision ??
    academicData?.admissionType ??
    inscripcion?.enrollment?.enrollmentType ??
    null;

  const carrera = etiquetaAcademica(
    academicData?.career || inscripcion?.career,
    academicData?.careerId ?? academicData?.carreraId,
  );

  const gestion = etiquetaAcademica(
    academicData?.management || inscripcion?.management,
    academicData?.managementId ?? academicData?.gestionIngresoId,
  );

  return (
    <>
      <DetailInfoCard title="Datos personales" icon={<UserOutlined />} cols={3}>
        <DetailField label="Código de estudiante">{valor(student.studentCode)}</DetailField>
        <DetailField label="Cédula de identidad">{ciCompleto(student.ci, student.expedition)}</DetailField>
        <DetailField label="Tipo de sangre">{valor(student.bloodType)}</DetailField>

        <DetailField label="Nombres">{valor(student.firstName)}</DetailField>
        <DetailField label="Apellido paterno">{valor(student.lastName)}</DetailField>
        <DetailField label="Apellido materno">{valor(student.motherLastName)}</DetailField>

        <DetailField label="Nombre completo" span={3}>{nombreCompleto}</DetailField>

        <DetailField label="Fecha de nacimiento">{valor(student.birthDate)}</DetailField>
        <DetailField label="Género">{valor(student.gender)}</DetailField>
        <DetailField label="Estado civil">{valor(student.estadoCivilNombre)}</DetailField>

        <DetailField label="Correo personal" span={2}>{valor(student.personalEmail)}</DetailField>
        <DetailField label="Celular">{valor(student.mobilePhone)}</DetailField>

        <DetailField label="Teléfono fijo">{valor(student.landlinePhone)}</DetailField>
        <DetailField label="Zona">{valor(student.zone)}</DetailField>
        <DetailField label="Dirección">{valor(student.address)}</DetailField>

        <DetailField label="Residencia" span={3}>{residencia(student)}</DetailField>
      </DetailInfoCard>

      {academicData || inscripcion ? (
        <DetailInfoCard title="Datos académicos" icon={<BookOutlined />} cols={3}>
          <DetailField label="Carrera" span={2}>{carrera}</DetailField>
          <DetailField label="Tipo de admisión">{valor(tipoAdmision)}</DetailField>
          <DetailField label="Gestión de ingreso">{gestion}</DetailField>
        </DetailInfoCard>
      ) : null}

      {guardians.length > 0
        ? guardians.map((g, i) => <GuardianCard key={g.id || i} guardian={g} />)
        : null}
    </>
  );
};

export default EstudianteFichaSection;
