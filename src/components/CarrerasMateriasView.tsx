import React, { useState } from 'react';
import { Carrera, Materia, TurnoEstudio } from '../types';
import { 
  GraduationCap, 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Clock, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  FileText,
  Sparkles,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { IngDataCompLogo } from './IngDataCompLogo';

interface CarrerasMateriasViewProps {
  carreras: Carrera[];
  materias: Materia[];
  onGuardarCarrera: (carrera: Partial<Carrera>) => void;
  onEliminarCarrera: (id: string) => void;
  onGuardarMateria: (materia: Partial<Materia>) => void;
  onEliminarMateria: (id: string) => void;
  customLogoUrl?: string | null;
  onRestaurarBaseDatos?: () => void;
}

export const CarrerasMateriasView: React.FC<CarrerasMateriasViewProps> = ({
  carreras,
  materias,
  onGuardarCarrera,
  onEliminarCarrera,
  onGuardarMateria,
  onEliminarMateria,
  customLogoUrl,
  onRestaurarBaseDatos
}) => {
  // Carrera seleccionada para ver su Malla Curricular Anual
  const [carreraSeleccionadaId, setCarreraSeleccionadaId] = useState<string>(carreras[0]?.id || '');
  // Año de estudio seleccionado: 1 = 1er Año, 2 = 2do Año, 3 = 3er Año, 'todos' = Ver todos los años
  const [anioFiltro, setAnioFiltro] = useState<number | 'todos'>(1);

  // Modales
  const [modalCarrera, setModalCarrera] = useState(false);
  const [carreraEditando, setCarreraEditando] = useState<Carrera | null>(null);

  const [modalMateria, setModalMateria] = useState(false);
  const [materiaEditando, setMateriaEditando] = useState<Materia | null>(null);

  // Modal confirmación eliminar
  const [eliminarItem, setEliminarItem] = useState<{ tipo: 'carrera' | 'materia'; id: string; nombre: string } | null>(null);

  // Estados formulario Carrera
  const [carCodigo, setCarCodigo] = useState('');
  const [carNombre, setCarNombre] = useState('');
  const [carResolucion, setCarResolucion] = useState('R.M. No. 0397/2024');
  const [carDuracionAnios, setCarDuracionAnios] = useState(3);
  const [carColor, setCarColor] = useState('#1E3A8A');
  const [carTurnos, setCarTurnos] = useState<TurnoEstudio[]>(['Mañana', 'Noche']);

  // Estados formulario Materia Anual
  const [matCodigo, setMatCodigo] = useState('');
  const [matNombre, setMatNombre] = useState('');
  const [matCarreraId, setMatCarreraId] = useState(carreras[0]?.id || '');
  const [matAnio, setMatAnio] = useState<1 | 2 | 3>(1);
  const [matCargaHoraria, setMatCargaHoraria] = useState(120);
  const [matDocente, setMatDocente] = useState('');
  const [matPrerrequisito, setMatPrerrequisito] = useState('Ninguno');

  const carreraActual = carreras.find(c => c.id === carreraSeleccionadaId) || carreras[0];

  // Materias de la carrera seleccionada
  const materiasDeCarrera = materias.filter(m => m.carreraId === (carreraActual?.id || ''));

  // Materias filtradas por año
  const materiasFiltradas = materiasDeCarrera.filter(m => {
    if (anioFiltro === 'todos') return true;
    return m.anio === anioFiltro;
  });

  // Conteo de materias por año
  const conteo1erAnio = materiasDeCarrera.filter(m => m.anio === 1).length;
  const conteo2doAnio = materiasDeCarrera.filter(m => m.anio === 2).length;
  const conteo3erAnio = materiasDeCarrera.filter(m => m.anio === 3).length;
  const horasTotales = materiasDeCarrera.reduce((acc, m) => acc + (m.cargaHoraria || 0), 0);

  // Abrir modal Carrera
  const abrirModalNuevaCarrera = () => {
    setCarreraEditando(null);
    setCarCodigo('CARR-' + (carreras.length + 1));
    setCarNombre('');
    setCarResolucion('R.M. No. 0397/2024');
    setCarDuracionAnios(3);
    setCarColor('#1E3A8A');
    setCarTurnos(['Mañana', 'Noche']);
    setModalCarrera(true);
  };

  const abrirModalEditarCarrera = (car: Carrera) => {
    setCarreraEditando(car);
    setCarCodigo(car.codigo);
    setCarNombre(car.nombre);
    setCarResolucion(car.resolucion || 'R.M. No. 0397/2024');
    setCarDuracionAnios(car.duracionAnios || 3);
    setCarColor(car.color || '#1E3A8A');
    setCarTurnos(car.turnoDisponibles || ['Mañana', 'Noche']);
    setModalCarrera(true);
  };

  const submitCarrera = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardarCarrera({
      id: carreraEditando?.id,
      codigo: carCodigo,
      nombre: carNombre,
      resolucion: carResolucion,
      duracionAnios: Number(carDuracionAnios),
      regimen: 'Anualizado',
      color: carColor,
      turnoDisponibles: carTurnos
    });
    setModalCarrera(false);
  };

  // Abrir modal Materia
  const abrirModalNuevaMateria = (anioSugerido?: 1 | 2 | 3) => {
    const anio: 1 | 2 | 3 = anioSugerido || (typeof anioFiltro === 'number' ? (anioFiltro as 1 | 2 | 3) : 1);
    setMateriaEditando(null);
    const prefijo = carreraActual?.codigo ? carreraActual.codigo.slice(0, 3) : 'MAT';
    const num = materiasDeCarrera.filter(m => m.anio === anio).length + 1;
    setMatCodigo(`${prefijo}-${anio}0${num}`);
    setMatNombre('');
    setMatCarreraId(carreraActual?.id || carreras[0]?.id || '');
    setMatAnio(anio);
    setMatCargaHoraria(120);
    setMatDocente('');
    setMatPrerrequisito(anio === 1 ? 'Ninguno' : `${prefijo}-${anio - 1}01`);
    setModalMateria(true);
  };

  const abrirModalEditarMateria = (mat: Materia) => {
    setMateriaEditando(mat);
    setMatCodigo(mat.codigo);
    setMatNombre(mat.nombre);
    setMatCarreraId(mat.carreraId);
    setMatAnio(mat.anio);
    setMatCargaHoraria(mat.cargaHoraria);
    setMatDocente(mat.docente);
    setMatPrerrequisito(mat.prerrequisito || 'Ninguno');
    setModalMateria(true);
  };

  const submitMateria = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardarMateria({
      id: materiaEditando?.id,
      codigo: matCodigo,
      nombre: matNombre,
      carreraId: matCarreraId,
      anio: Number(matAnio) as 1 | 2 | 3,
      cargaHoraria: Number(matCargaHoraria),
      docente: matDocente,
      prerrequisito: matPrerrequisito
    });
    setModalMateria(false);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="shrink-0">
            <IngDataCompLogo size="md" customLogoUrl={customLogoUrl} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Carreras Técnicas y Asignaturas Anuales
              </h1>
              <span className="bg-blue-100 text-blue-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-blue-200 uppercase">
                Régimen Anualizado (3 Años)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Administración de la Malla Curricular Anual: Ingresa y organiza entre 8 y 10 materias por año (1er, 2do y 3er Año) para cada carrera técnica superior.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {onRestaurarBaseDatos && (
            <button
              onClick={() => {
                if (window.confirm('¿Deseas restaurar la base de datos oficial completa de Carreras, Materias, Alumnos Ficticios y Calificaciones?')) {
                  onRestaurarBaseDatos();
                }
              }}
              title="Restaurar toda la malla de materias y carreras oficiales"
              className="px-4 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 border border-amber-300 font-bold rounded-2xl text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2 w-full md:w-auto cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-700" />
              <span>Restaurar Base de Datos</span>
            </button>
          )}
          <button
            onClick={abrirModalNuevaCarrera}
            className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 w-full md:w-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nueva Carrera</span>
          </button>
        </div>
      </div>

      {/* Selector de Carrera */}
      {carreras.length === 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-amber-950">No hay carreras ni asignaturas registradas</h3>
            <p className="text-xs sm:text-sm text-amber-800 max-w-md mx-auto mt-1">
              Las carreras profesionales y materias se encuentran vacías. Puedes restaurar la base de datos oficial completa de inmediato.
            </p>
          </div>
          {onRestaurarBaseDatos && (
            <button
              onClick={onRestaurarBaseDatos}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-2xl text-sm shadow-md transition cursor-pointer inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restaurar Base de Datos Oficial (4 Carreras y 48 Asignaturas)</span>
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {carreras.map(c => {
          const materiasC = materias.filter(m => m.carreraId === c.id);
          const activa = c.id === carreraActual?.id;
          return (
            <div
              key={c.id}
              onClick={() => {
                setCarreraSeleccionadaId(c.id);
                setMatCarreraId(c.id);
              }}
              className={`p-4 rounded-2xl border-2 transition cursor-pointer relative overflow-hidden ${
                activa 
                  ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-500/20' 
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div 
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: c.color || '#1E3A8A' }}
              />

              <div className="flex items-start justify-between mt-1">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {c.codigo}
                  </span>
                  <h3 className="font-black text-sm text-slate-900 mt-1.5 leading-snug">
                    {c.nombre}
                  </h3>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    abrirModalEditarCarrera(c);
                  }}
                  title="Editar Carrera"
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1 text-blue-900 font-bold">
                  <BookOpen className="w-3 h-3 text-blue-600" />
                  {materiasC.length} Materias Anuales
                </span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-full font-semibold">
                  3 Años (Técnico Sup.)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Panel de Asignaturas Anuales de la Carrera Seleccionada */}
      {carreraActual && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Cabecera del Panel */}
          <div className="p-6 border-b border-slate-200/80 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-md">
                    {carreraActual.codigo}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {carreraActual.nombre}
                  </h2>
                </div>
                <p className="text-xs text-blue-200/90 font-medium mt-1 flex items-center gap-3">
                  <span>Régimen Anualizado (3 Años)</span>
                  <span>•</span>
                  <span>{carreraActual.resolucion || 'R.M. No. 0397/2024'}</span>
                  <span>•</span>
                  <span>Carga Total: {horasTotales} Horas Académicas</span>
                </p>
              </div>

              <button
                onClick={() => abrirModalNuevaMateria()}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Agregar Materia Anual</span>
              </button>
            </div>

            {/* Pestañas de Años de Formación (1er Año, 2do Año, 3er Año) */}
            <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1">
              <button
                onClick={() => setAnioFiltro(1)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                  anioFiltro === 1
                    ? 'bg-white text-blue-950 shadow-md'
                    : 'bg-blue-900/40 text-blue-200 hover:bg-blue-900/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>1er Año</span>
                <span className="bg-blue-100 text-blue-900 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {conteo1erAnio} materias
                </span>
              </button>

              <button
                onClick={() => setAnioFiltro(2)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                  anioFiltro === 2
                    ? 'bg-white text-blue-950 shadow-md'
                    : 'bg-blue-900/40 text-blue-200 hover:bg-blue-900/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2do Año</span>
                <span className="bg-blue-100 text-blue-900 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {conteo2doAnio} materias
                </span>
              </button>

              <button
                onClick={() => setAnioFiltro(3)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                  anioFiltro === 3
                    ? 'bg-white text-blue-950 shadow-md'
                    : 'bg-blue-900/40 text-blue-200 hover:bg-blue-900/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>3er Año</span>
                <span className="bg-blue-100 text-blue-900 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {conteo3erAnio} materias
                </span>
              </button>

              <button
                onClick={() => setAnioFiltro('todos')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  anioFiltro === 'todos'
                    ? 'bg-white text-blue-950 shadow-md'
                    : 'bg-blue-900/40 text-blue-200 hover:bg-blue-900/60'
                }`}
              >
                <span>Ver Malla Completa (Todos los Años)</span>
              </button>
            </div>
          </div>

          {/* Tabla de Materias */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-2 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-800 text-base">
                  {anioFiltro === 'todos' ? 'Todas las Asignaturas Anuales' : `Asignaturas Anuales de ${anioFiltro}er Año`}
                </h3>
                <p className="text-xs text-slate-500">
                  {materiasFiltradas.length} materia(s) registrada(s). Se recomienda entre 8, 9 o 10 materias anuales por cada año de estudio.
                </p>
              </div>

              {typeof anioFiltro === 'number' && (
                <button
                  onClick={() => abrirModalNuevaMateria(anioFiltro as 1 | 2 | 3)}
                  className="px-3.5 py-1.5 bg-blue-50 text-blue-900 hover:bg-blue-100 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-blue-200 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Materia a {anioFiltro}° Año</span>
                </button>
              )}
            </div>

            {materiasFiltradas.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 mt-4">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 text-sm">No hay materias registradas para este año</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Agrega las asignaturas anuales correspondientes a este año formativo (puedes registrar 8, 9 o hasta 10 materias).
                </p>
                <button
                  onClick={() => abrirModalNuevaMateria(typeof anioFiltro === 'number' ? (anioFiltro as 1 | 2 | 3) : 1)}
                  className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-blue-800 transition"
                >
                  + Agregar Primera Materia
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-3 w-12 text-center">N°</th>
                      <th className="py-3 px-3">Código</th>
                      <th className="py-3 px-4">Asignatura Anual</th>
                      <th className="py-3 px-3 text-center">Año</th>
                      <th className="py-3 px-3 text-center">Carga Horaria</th>
                      <th className="py-3 px-4">Docente Titular</th>
                      <th className="py-3 px-3">Prerrequisito</th>
                      <th className="py-3 px-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {materiasFiltradas.map((mat, idx) => (
                      <tr key={mat.id} className="hover:bg-slate-50/80 transition group">
                        <td className="py-3 px-3 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-blue-900">
                          {mat.codigo}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {mat.nombre}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            mat.anio === 1 ? 'bg-emerald-100 text-emerald-900' :
                            mat.anio === 2 ? 'bg-blue-100 text-blue-900' :
                            'bg-purple-100 text-purple-900'
                          }`}>
                            {mat.anio}° Año
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700">
                          {mat.cargaHoraria} hrs
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {mat.docente || <span className="text-slate-400 italic">Por asignar</span>}
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-xs font-mono">
                          {mat.prerrequisito || 'Ninguno'}
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5">
                          <button
                            onClick={() => abrirModalEditarMateria(mat)}
                            title="Editar Asignatura"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition inline-flex items-center"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEliminarItem({ tipo: 'materia', id: mat.id, nombre: mat.nombre })}
                            title="Eliminar Asignatura"
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition inline-flex items-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR CARRERA */}
      {modalCarrera && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-blue-950 to-slate-900 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-black text-lg">
                  {carreraEditando ? 'Editar Carrera' : 'Nueva Carrera Técnica'}
                </h3>
                <p className="text-xs text-blue-200">
                  Régimen Anualizado (3 Años de Estudio)
                </p>
              </div>
              <button 
                onClick={() => setModalCarrera(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitCarrera} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Código de Carrera *
                </label>
                <input
                  type="text"
                  required
                  value={carCodigo}
                  onChange={(e) => setCarCodigo(e.target.value.toUpperCase())}
                  placeholder="ej: SIS-INF"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nombre de la Carrera *
                </label>
                <input
                  type="text"
                  required
                  value={carNombre}
                  onChange={(e) => setCarNombre(e.target.value)}
                  placeholder="ej: Sistemas Informáticos"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Resolución Ministerial *
                </label>
                <input
                  type="text"
                  required
                  value={carResolucion}
                  onChange={(e) => setCarResolucion(e.target.value)}
                  placeholder="R.M. No. 0397/2024"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Duración (Años)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={carDuracionAnios}
                    onChange={(e) => setCarDuracionAnios(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Nivel Técnico Superior</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Color Distintivo
                  </label>
                  <input
                    type="color"
                    value={carColor}
                    onChange={(e) => setCarColor(e.target.value)}
                    className="w-full h-10 p-1 bg-slate-50 border border-slate-300 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalCarrera(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  Guardar Carrera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR MATERIA ANUAL */}
      {modalMateria && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-blue-950 to-indigo-950 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-black text-lg">
                  {materiaEditando ? 'Editar Asignatura Anual' : 'Nueva Asignatura Anual'}
                </h3>
                <p className="text-xs text-blue-200">
                  {carreraActual?.nombre} • Régimen Anualizado
                </p>
              </div>
              <button 
                onClick={() => setModalMateria(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitMateria} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Año de Formación *
                  </label>
                  <select
                    value={matAnio}
                    onChange={(e) => setMatAnio(Number(e.target.value) as 1 | 2 | 3)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1er Año (Primer Año)</option>
                    <option value={2}>2do Año (Segundo Año)</option>
                    <option value={3}>3er Año (Tercer Año)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Código de Materia *
                  </label>
                  <input
                    type="text"
                    required
                    value={matCodigo}
                    onChange={(e) => setMatCodigo(e.target.value.toUpperCase())}
                    placeholder="ej: SIS-101"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nombre de la Asignatura *
                </label>
                <input
                  type="text"
                  required
                  value={matNombre}
                  onChange={(e) => setMatNombre(e.target.value)}
                  placeholder="ej: Programación I y Lógica de Algoritmos"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Carga Horaria Anual *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={40}
                      max={300}
                      step={10}
                      value={matCargaHoraria}
                      onChange={(e) => setMatCargaHoraria(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold">
                      horas
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Prerrequisito
                  </label>
                  <input
                    type="text"
                    value={matPrerrequisito}
                    onChange={(e) => setMatPrerrequisito(e.target.value)}
                    placeholder="ej: SIS-101 o Ninguno"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Docente Titular Asignado
                </label>
                <input
                  type="text"
                  value={matDocente}
                  onChange={(e) => setMatDocente(e.target.value)}
                  placeholder="ej: Ing. Carlos Mamani Torrico"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalMateria(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  Guardar Materia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINAR */}
      {eliminarItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">¿Confirmas la eliminación?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Se eliminará {eliminarItem.tipo === 'carrera' ? 'la carrera' : 'la materia'}:
              </p>
              <p className="font-bold text-slate-800 text-sm mt-1">{eliminarItem.nombre}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEliminarItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (eliminarItem.tipo === 'carrera') {
                    onEliminarCarrera(eliminarItem.id);
                  } else {
                    onEliminarMateria(eliminarItem.id);
                  }
                  setEliminarItem(null);
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md transition"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
