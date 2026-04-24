/**
 * Definición de campos de la segunda card del paso final («Credenciales y acceso al sistema»).
 * Usuario y contraseñas; el rol va en la card anterior (`UsuarioWizardCredencialesStepContent`).
 * El `rol_id` se fija en pasos anteriores o por reglas de categoría (ver `UsuarioCreatePage`).
 *
 * Archivo .jsx porque incluye nodos React (p. ej. icono en la config).
 */

import { UserOutlined } from '@ant-design/icons';

const PRESERVE = { preserve: true };

export function createUsuarioWizardCredencialesFields() {
  return [
    {
      key: 'username',
      name: 'username',
      label: 'Usuario',
      type: 'input',
      inputType: 'text',
      required: true,
      maxLength: 50,
      span: 12,
      placeholder: 'ej: jperez',
      icon: <UserOutlined />,
      ...PRESERVE,
    },
    {
      key: 'password',
      name: 'password',
      label: 'Contraseña',
      type: 'input',
      inputType: 'password',
      required: true,
      span: 12,
      placeholder: 'Mínimo 8 caracteres',
      hasFeedback: true,
      rules: [{ min: 8, message: 'Mínimo 8 caracteres' }],
      ...PRESERVE,
    },
    {
      key: 'password_confirm',
      name: 'password_confirm',
      label: 'Confirmar contraseña',
      type: 'input',
      inputType: 'password',
      required: true,
      span: 12,
      placeholder: 'Repita la contraseña',
      dependencies: ['password'],
      hasFeedback: true,
      rules: [
        { min: 8, message: 'Mínimo 8 caracteres' },
        ({ getFieldValue }) => ({
          validator(_, value) {
            const pwd = getFieldValue('password');
            if (!value || pwd === value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error('Las contraseñas no coinciden'));
          },
        }),
      ],
      ...PRESERVE,
    },
  ];
}
