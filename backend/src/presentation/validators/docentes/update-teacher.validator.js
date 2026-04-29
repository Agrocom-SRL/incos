import { createTeacherValidator } from './create-teacher.validator.js';

/** Misma forma que alta; PUT reemplaza el recurso con el mismo contrato de cuerpo. */
export const updateTeacherValidator = [...createTeacherValidator];
