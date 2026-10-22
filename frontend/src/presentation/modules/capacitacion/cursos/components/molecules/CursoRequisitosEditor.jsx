/**
 * Molécula: sección «Requisitos de inscripción» de un curso de capacitación (CAP).
 *
 * Mismo patrón que los contactos de emergencia de la matrícula y que los grupos del
 * curso: `FormWorkspaceSection` con una sub-sección por requisito (título, botón
 * eliminar, campos etiquetados) y un botón «Agregar otro requisito» al final. Los valores
 * viven en el `Form` bajo `requisitos[i].{id,key,descripcion,obligatorio,acreditaPagoCurso}`; el `orden`
 * que viaja al backend se deriva de la posición (ver `mapRequisitosFormToPayload`).
 */

import { useEffect, useMemo, useRef } from 'react';
import { Form } from 'antd';
import { FormWorkspaceSection } from '@organisms';
import {
  crearRequisitoVacio,
  dejarUnSoloAcreditaPago,
  quitarItem,
} from '@application-capacitacion/utils/requisitosCapacitacion';

/** Campos de un requisito (id y `key` ocultos para no perderlos al guardar). */
const camposRequisito = (index, tieneEntidad) => [
  { name: ['requisitos', index, 'id'], type: 'hidden', hidden: true },
  { name: ['requisitos', index, 'key'], type: 'hidden', hidden: true },
  {
    name: ['requisitos', index, 'descripcion'],
    label: 'Descripción del requisito',
    type: 'input',
    required: true,
    span: 24,
    placeholder: 'Ej. Dos fotocopias de cédula de identidad vigente',
    maxLength: 255,
  },
  {
    name: ['requisitos', index, 'acreditaPagoCurso'],
    label: 'Acredita el pago del costo del curso',
    type: 'switch',
    span: 12,
    checkedChildren: 'Sí',
    unCheckedChildren: 'No',
    disabled: !tieneEntidad,
    extra: tieneEntidad
      ? 'Al entregarse (p. ej. fotocopia del depósito), el costo del curso queda pagado a la entidad certificadora. Solo un requisito puede acreditarlo.'
      : 'Disponible solo si el curso tiene entidad certificadora.',
  },
  {
    name: ['requisitos', index, 'obligatorio'],
    label: 'Obligatorio',
    type: 'switch',
    span: 12,
    checkedChildren: 'Sí',
    unCheckedChildren: 'No',
  },
];

const CursoRequisitosEditor = ({ title, description }) => {
  const form = Form.useFormInstance();
  // `preserve: true`: la lista no es un campo registrado (solo lo son sus campos internos),
  // así que sin esto `useWatch` no ve los cambios y la pantalla no se redibuja.
  const watched = Form.useWatch('requisitos', { form, preserve: true });
  const requisitos = useMemo(() => (Array.isArray(watched) ? watched : []), [watched]);
  const entidad = Form.useWatch('entidadCertificadora', { form, preserve: true });
  const tieneEntidad = String(entidad ?? '').trim() !== '';
  const setRequisitos = (lista) => form.setFieldsValue({ requisitos: lista });

  // Un solo requisito acredita el pago: el recién activado desactiva a los demás.
  const previa = useRef(requisitos);
  useEffect(() => {
    const ajustada = dejarUnSoloAcreditaPago(requisitos, previa.current);
    previa.current = ajustada;
    if (ajustada !== requisitos) form.setFieldsValue({ requisitos: ajustada });
  }, [requisitos, form]);

  const fields = [
    ...requisitos.map((requisito, index) => ({
      type: 'subsection',
      subsectionTitle: `Requisito ${index + 1}`,
      subsectionIndex: requisito.key ?? requisito.id ?? index,
      fields: camposRequisito(index, tieneEntidad),
      showDeleteButton: true,
      onDelete: () => setRequisitos(quitarItem(requisitos, index)),
    })),
    {
      type: 'button',
      name: 'agregarRequisito',
      label: '',
      buttonText: requisitos.length === 0 ? 'Agregar requisito' : 'Agregar otro requisito',
      variant: 'info',
      style: 'outlined',
      span: 24,
      onClick: () => setRequisitos([...requisitos, crearRequisitoVacio()]),
    },
  ];

  return (
    <FormWorkspaceSection
      title={title}
      description={
        requisitos.length === 0
          ? `${description} El curso no exige requisitos por ahora.`
          : description
      }
      fields={fields}
      form={form}
    />
  );
};

export default CursoRequisitosEditor;
