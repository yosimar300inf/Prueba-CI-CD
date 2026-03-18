export interface AsignarDocenteBody {
  rol: string;
  docenteId: number;
  docenteNombre: string;
  nombreAsignatura: string;
  codigoAsignatura: string;
  periodoAcademico: string;
  mensajeDocente?: string;
}

export function procesarAsignacionDocente(data: AsignarDocenteBody) {
  const {
    rol,
    docenteId,
    docenteNombre,
    nombreAsignatura,
    codigoAsignatura,
    periodoAcademico,
    mensajeDocente,
  } = data;

  const errores: string[] = [];

  if (!rol || rol.trim().toLowerCase() !== "director de escuela") {
    errores.push("El rol debe ser 'Director de Escuela'.");
  }

  if (!docenteId || !docenteNombre) {
    errores.push("Debe seleccionar un docente.");
  }

  if (!nombreAsignatura || nombreAsignatura.length < 5) {
    errores.push("El nombre de la asignatura debe tener al menos 5 caracteres.");
  }

  if (!codigoAsignatura) {
    errores.push("El código de asignatura es obligatorio.");
  }

  if (!periodoAcademico) {
    errores.push("El periodo académico es obligatorio.");
  }

  if (mensajeDocente && mensajeDocente.length > 400) {
    errores.push("El mensaje no puede superar 400 caracteres.");
  }

  if (errores.length > 0) {
    return {
      ok: false,
      status: 400,
      errores,
    };
  }

  return {
    ok: true,
    status: 200,
    message: "Asignación procesada correctamente",
  };
}