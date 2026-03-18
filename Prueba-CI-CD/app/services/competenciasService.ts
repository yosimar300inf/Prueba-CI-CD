export type SeccionClave = 'competencia' | 'componentes' | 'contenidosActitudinales';

export interface RegistroItem {
  id: string;
  texto: string;
}

export interface CompetenciasFormData {
  competencia: RegistroItem[];
  componentes: RegistroItem[];
  contenidosActitudinales: RegistroItem[];
}

const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

const generarId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const clonar = <T,>(data: T): T => JSON.parse(JSON.stringify(data));

let fakeDatabase: CompetenciasFormData = {
  competencia: [
    {
      id: generarId(),
      texto: 'Elabora y gestiona proyectos de diversa índole, vinculados a la profesión. (g)',
    },
    {
      id: generarId(),
      texto:
        'Analiza un sistema complejo de computación y aplica principios de computación y otras disciplinas relevantes para identificar soluciones. (i)',
    },
  ],
  componentes: [
    {
      id: generarId(),
      texto: 'Elabora trabajos de aplicación o proyectos vinculados a la especialidad. (g1)',
    },
    {
      id: generarId(),
      texto: 'Gestiona proyectos de diversa índole, vinculados a la especialidad. (g2)',
    },
  ],
  contenidosActitudinales: [
    {
      id: generarId(),
      texto: 'Búsqueda de la verdad. (b)',
    },
    {
      id: generarId(),
      texto: 'Compromiso ético en todo su quehacer. (c)',
    },
  ],
};

export function crearRegistroVacio(): RegistroItem {
  return {
    id: generarId(),
    texto: '',
  };
}

export async function obtenerCompetenciasForm(): Promise<CompetenciasFormData> {
  await wait();
  return clonar(fakeDatabase);
}

export async function guardarCompetenciasForm(
  payload: CompetenciasFormData
): Promise<CompetenciasFormData> {
  await wait();
  fakeDatabase = clonar(payload);
  return clonar(fakeDatabase);
}
