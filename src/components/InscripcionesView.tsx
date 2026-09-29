import React, { useState, useEffect } from 'react';
import { 
  Carrera, 
  Estudiante, 
  ExpedidoBolivia, 
  TurnoEstudio, 
  Materia, 
  ConfiguracionInstituto, 
  CostoCarrera,
  TipoDescuento,
  MetodoPago,
  PagoCuotaEstudiante,
  TransaccionPago
} from '../types';
import { 
  UserPlus, 
  Search, 
  Trash2, 
  Edit, 
  Award, 
  Download, 
  Phone, 
  Mail, 
  X, 
  AlertTriangle,
  GraduationCap,
  Layers,
  RotateCcw,
  Printer,
  CheckCircle2,
  FileText,
  DollarSign,
  Tag,
  CreditCard,
  Percent,
  Receipt
} from 'lucide-react';
import { BoletaMatriculaEstudianteModal } from './BoletaMatriculaEstudianteModal';
import { KardexFinancieroModal } from './KardexFinancieroModal';
import { COSTOS_CARRERAS_INICIALES } from '../data/initialData';

interface InscripcionesViewProps {
  estudiantes: Estudiante[];
  carreras: Carrera[];
  materias?: Materia[];
  institutoConfig?: ConfiguracionInstituto;
  customLogoUrl?: string | null;
  costosCarreras?: CostoCarrera[];
  pagosCuotas?: PagoCuotaEstudiante[];
  onRegistrarPagoCuota?: (pagoActualizado: PagoCuotaEstudiante, nuevaTx: TransaccionPago) => void;
  onGuardarEstudiante: (estudiante: Partial<Estudiante>) => Estudiante | void;
  onEliminarEstudiante: (id: string) => void;
  onVerBoletin: (estudianteId: string) => void;
  modalAbierto: boolean;
  setModalAbierto: (abierto: boolean) => void;
  onRestaurarBaseDatos?: () => void;
  onAbrirReporteInscritos?: () => void;
  onIrAPagos?: () => void;
}

export const InscripcionesView: React.FC<InscripcionesViewProps> = ({
  estudiantes,
  carreras,
  materias = [],
  institutoConfig,
  customLogoUrl,
  costosCarreras = COSTOS_CARRERAS_INICIALES,
  pagosCuotas = [],
  onRegistrarPagoCuota,
  onGuardarEstudiante,
  onEliminarEstudiante,
  onVerBoletin,
  modalAbierto,
  setModalAbierto,
  onRestaurarBaseDatos,
  onAbrirReporteInscritos,
  onIrAPagos
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroCarrera, setFiltroCarrera] = useState('');
  const [filtroAnio, setFiltroAnio] = useState<string>('todos');
  const [filtroTurno, setFiltroTurno] = useState('');

  // Estados para formulario del estudiante
  const [estudianteEditando, setEstudianteEditando] = useState<Estudiante | null>(null);
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [ci, setCi] = useState('');
  const [expedido, setExpedido] = useState<ExpedidoBolivia>('CB');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [carreraId, setCarreraId] = useState(carreras[0]?.id || '');
  const [anioActual, setAnioActual] = useState<1 | 2 | 3>(1);
  const [turno, setTurno] = useState<TurnoEstudio>('Mañana');
  const [observaciones, setObservaciones] = useState('');

  // Estados Económicos: Matrícula, 10 Cuotas, Descuentos y Pago Inicial
  const [costoMatricula, setCostoMatricula] = useState<number>(300);
  const [descuentoMatricula, setDescuentoMatricula] = useState<number>(0);
  const [costoMensualidad, setCostoMensualidad] = useState<number>(380);
  const [descuentoMensualidad, setDescuentoMensualidad] = useState<number>(0);
  const [tipoDescuento, setTipoDescuento] = useState<TipoDescuento>('Ninguno');
  const [otrosCostos, setOtrosCostos] = useState<number>(50);
  const [conceptoOtros, setConceptoOtros] = useState<string>('Seguro estudiantil y carnet institucional');
  const [montoPagadoInicial, setMontoPagadoInicial] = useState<number>(300);
  const [metodoPagoInicial, setMetodoPagoInicial] = useState<MetodoPago>('Efectivo');
  const [nroReciboInicial, setNroReciboInicial] = useState<string>('REC-2026-0101');

  // Estados para Boleta Oficial de Inscripción (Copia Estudiante y Empresa)
  const [modalBoletaAbierto, setModalBoletaAbierto] = useState(false);
  const [boletaEstudianteSeleccionado, setBoletaEstudianteSeleccionado] = useState<Estudiante | null>(null);
  const [matriculaExitosa, setMatriculaExitosa] = useState(false);
  const [estudianteRecienInscrito, setEstudianteRecienInscrito] = useState<Estudiante | null>(null);

  // Estado para Kárdex Financiero Imprimible y en Pantalla
  const [modalKardexAbierto, setModalKardexAbierto] = useState(false);
  const [kardexEstudianteSeleccionado, setKardexEstudianteSeleccionado] = useState<Estudiante | null>(null);

  // Modal confirmación de eliminación
  const [idParaEliminar, setIdParaEliminar] = useState<string | null>(null);

  // Al cambiar de carrera en el formulario, cargar sus costos oficiales
  const actualizarCostosSegunCarrera = (idCar: string) => {
    const costoC = costosCarreras.find(c => c.carreraId === idCar) || costosCarreras[0] || COSTOS_CARRERAS_INICIALES[0];
    setCostoMatricula(costoC.costoMatriculaBs);
    setCostoMensualidad(costoC.costoMensualidadBs);
    setOtrosCostos(costoC.otrosCostosBs);
    setConceptoOtros(costoC.descripcionOtrosCostos || 'Seguro estudiantil y carnet institucional');
    setDescuentoMatricula(0);
    setDescuentoMensualidad(0);
    setTipoDescuento('Ninguno');
    setMontoPagadoInicial(costoC.costoMatriculaBs);
  };

  // Al cambiar el tipo de descuento
  const handleCambioTipoDescuento = (tipo: TipoDescuento) => {
    setTipoDescuento(tipo);
    const costoC = costosCarreras.find(c => c.carreraId === carreraId) || costosCarreras[0] || COSTOS_CARRERAS_INICIALES[0];
    const baseMat = costoC.costoMatriculaBs;
    const basePen = costoC.costoMensualidadBs;

    switch (tipo) {
      case 'Pronto Pago':
        // 10% en mensualidad
        setDescuentoMensualidad(Math.round(basePen * 0.10));
        setDescuentoMatricula(0);
        break;
      case 'Beca Excelencia':
        // 50% de descuento en matrícula y pensión
        setDescuentoMatricula(Math.round(baseMat * 0.50));
        setDescuentoMensualidad(Math.round(basePen * 0.50));
        break;
      case 'Descuento Hermanos':
        // 15% en mensualidad
        setDescuentoMensualidad(Math.round(basePen * 0.15));
        setDescuentoMatricula(0);
        break;
      case 'Convenio Institucional':
        // 20% en mensualidad
        setDescuentoMensualidad(Math.round(basePen * 0.20));
        setDescuentoMatricula(0);
        break;
      case 'Personalizado':
        // Dejar abiertos para ajuste manual
        break;
      case 'Ninguno':
      default:
        setDescuentoMatricula(0);
        setDescuentoMensualidad(0);
        break;
    }
  };

  const matriculaFinalCalculada = Math.max(0, costoMatricula - descuentoMatricula);
  const mensualidadFinalCalculada = Math.max(0, costoMensualidad - descuentoMensualidad);
  const totalPlanAnualCalculado = matriculaFinalCalculada + (mensualidadFinalCalculada * 10) + otrosCostos;
  const saldoInicialCalculado = Math.max(0, matriculaFinalCalculada - montoPagadoInicial);

  const abrirNuevoModal = () => {
    setEstudianteEditando(null);
    setMatriculaExitosa(false);
    setEstudianteRecienInscrito(null);
    setNombres('');
    setApellidos('');
    setCi('');
    setExpedido('CB');
    setEmail('');
    setTelefono('');
    const idCar = carreras[0]?.id || '';
    setCarreraId(idCar);
    setAnioActual(1);
    setTurno('Mañana');
    setObservaciones('');

    actualizarCostosSegunCarrera(idCar);

    const corr = Math.floor(1000 + Math.random() * 9000);
    setNroReciboInicial(`REC-2026-${corr}`);
    setMetodoPagoInicial('Efectivo');
    setModalAbierto(true);
  };

  const abrirEditarModal = (est: Estudiante) => {
    setEstudianteEditando(est);
    setMatriculaExitosa(false);
    setEstudianteRecienInscrito(null);
    setNombres(est.nombres);
    setApellidos(est.apellidos);
    setCi(est.ci);
    setExpedido(est.expedido);
    setEmail(est.email);
    setTelefono(est.telefono);
    setCarreraId(est.carreraId);
    setAnioActual((est.anioActual || 1) as 1 | 2 | 3);
    setTurno(est.turno);
    setObservaciones(est.observaciones || '');

    const costoC = costosCarreras.find(c => c.carreraId === est.carreraId) || costosCarreras[0];
    setCostoMatricula(est.costoMatriculaBs ?? costoC.costoMatriculaBs);
    setDescuentoMatricula(est.descuentoMatriculaBs ?? 0);
    setCostoMensualidad(est.costoMensualidadBs ?? costoC.costoMensualidadBs);
    setDescuentoMensualidad(est.descuentoMensualidadBs ?? 0);
    setTipoDescuento(est.tipoDescuento ?? 'Ninguno');
    setOtrosCostos(est.otrosCostosBs ?? costoC.otrosCostosBs);
    setConceptoOtros(est.conceptoOtrosCostos || costoC.descripcionOtrosCostos || 'Seguro estudiantil y carnet institucional');
    setMontoPagadoInicial(est.montoPagadoInicialBs ?? (est.montoMatriculaFinalBs ?? (est.costoMatriculaBs ?? costoC.costoMatriculaBs)));
    setMetodoPagoInicial(est.metodoPagoInicial ?? 'Efectivo');
    setNroReciboInicial(est.nroReciboInicial ?? `REC-2026-${est.codigo.replace(/[^0-9]/g, '').slice(-4)}`);

    setModalAbierto(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const matriculaFinal = Math.max(0, costoMatricula - descuentoMatricula);
    const mensualidadFinal = Math.max(0, costoMensualidad - descuentoMensualidad);
    const totalGestion = matriculaFinal + (mensualidadFinal * 10) + otrosCostos;
    const saldoInicial = Math.max(0, matriculaFinal - montoPagadoInicial);
    const fechaHoy = new Date().toISOString().slice(0, 10);

    const estudianteData: Partial<Estudiante> = {
      id: estudianteEditando?.id,
      codigo: estudianteEditando?.codigo,
      nombres,
      apellidos,
      ci,
      expedido,
      email,
      telefono,
      carreraId,
      anioActual: Number(anioActual) as 1 | 2 | 3,
      semestreActual: Number(anioActual) * 2 - 1,
      turno,
      estado: estudianteEditando?.estado || 'Activo',
      observaciones,
      costoMatriculaBs: costoMatricula,
      descuentoMatriculaBs: descuentoMatricula,
      montoMatriculaFinalBs: matriculaFinal,
      costoMensualidadBs: costoMensualidad,
      descuentoMensualidadBs: descuentoMensualidad,
      montoMensualidadFinalBs: mensualidadFinal,
      tipoDescuento,
      otrosCostosBs: otrosCostos,
      conceptoOtrosCostos: conceptoOtros,
      montoTotalGestionBs: totalGestion,
      montoPagadoInicialBs: montoPagadoInicial,
      saldoPendienteInicialBs: saldoInicial,
      metodoPagoInicial,
      nroReciboInicial,
      fechaPagoInicial: fechaHoy
    };

    const resultado = onGuardarEstudiante(estudianteData);

    const estFinal: Estudiante = (resultado as Estudiante) || {
      id: estudianteEditando?.id || `est-${Date.now()}`,
      codigo: estudianteEditando?.codigo || `IDC-2026-${String(estudiantes.length + 1).padStart(3, '0')}`,
      nombres,
      apellidos,
      ci,
      expedido,
      email,
      telefono,
      carreraId,
      anioActual: Number(anioActual) as 1 | 2 | 3,
      semestreActual: Number(anioActual) * 2 - 1,
      turno,
      estado: estudianteEditando?.estado || 'Activo',
      observaciones,
      fechaInscripcion: fechaHoy,
      ...estudianteData
    };

    setEstudianteRecienInscrito(estFinal);
    setMatriculaExitosa(true);
  };

  const estudiantesFiltrados = estudiantes.filter(e => {
    const matchTxt = (e.nombres + ' ' + e.apellidos + ' ' + e.ci + ' ' + e.codigo).toLowerCase().includes(busqueda.toLowerCase());
    const matchCarrera = !filtroCarrera || e.carreraId === filtroCarrera;
    const matchAnio = filtroAnio === 'todos' || String(e.anioActual || 1) === filtroAnio;
    const matchTurno = !filtroTurno || e.turno === filtroTurno;
    return matchTxt && matchCarrera && matchAnio && matchTurno;
  });

  const exportarCSV = () => {
    const cabeceras = ['Codigo,Nombres,Apellidos,CI,Expedido,Carrera,Ano_Estudio,Turno,Matricula_Bs,Pension_Mensual_Bs,Total_Gestion_Bs,Telefono,Email,Estado'];
    const filas = estudiantesFiltrados.map(e => {
      const c = carreras.find(car => car.id === e.carreraId)?.nombre || '';
      return `"${e.codigo}","${e.nombres}","${e.apellidos}","${e.ci}","${e.expedido}","${c}","${e.anioActual || 1}° Año","${e.turno}","${e.montoMatriculaFinalBs || 300}","${e.montoMensualidadFinalBs || 380}","${e.montoTotalGestionBs || 4150}","${e.telefono}","${e.email}","${e.estado}"`;
    });
    const blob = new Blob([cabeceras.concat(filas).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Estudiantes_ING_DATA_COMP_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado de la Sección */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Inscripciones y Matrícula de Estudiantes</span>
            <span className="bg-blue-100 text-blue-900 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Régimen Anualizado (10 Cuotas/Año)
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Matriculación en 1er, 2do y 3er Año de carreras técnicas superiores con aranceles oficiales (R.M. No. 0397/2024).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onRestaurarBaseDatos && (
            <button
              onClick={onRestaurarBaseDatos}
              title="Restaurar base de datos de estudiantes oficiales y notas"
              className="px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 font-bold text-xs hover:bg-amber-100 shadow-xs flex items-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>Restaurar Alumnos Oficiales</span>
            </button>
          )}

          {onIrAPagos && (
            <button
              onClick={onIrAPagos}
              title="Ir al módulo de cobranzas y control de las 10 cuotas"
              className="px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 font-bold text-xs hover:bg-emerald-100 shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Plan de 10 Cuotas</span>
            </button>
          )}

          <button
            onClick={exportarCSV}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exportar CSV</span>
          </button>

          {onAbrirReporteInscritos && (
            <button
              onClick={onAbrirReporteInscritos}
              title="Imprimir nómina oficial de alumnos inscritos en pantalla y en impresora (por carreras, cursos, materias y turnos)"
              className="px-4 py-2.5 rounded-xl border border-emerald-600 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Alumnos Inscritos</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              const estParaBoleta = estudianteRecienInscrito || estudiantes[0];
              if (estParaBoleta) {
                setBoletaEstudianteSeleccionado(estParaBoleta);
                setModalBoletaAbierto(true);
              }
            }}
            title="Imprimir Boleta Oficial de Inscripción (Doble Copia para Alumno y Empresa)"
            className="px-4 py-2.5 rounded-xl border border-blue-800 bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Boleta Alumno / Empresa</span>
          </button>

          <button
            onClick={abrirNuevoModal}
            className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-black rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Inscribir Estudiante</span>
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, CI, código..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={filtroCarrera}
            onChange={(e) => setFiltroCarrera(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700"
          >
            <option value="">Todas las Carreras</option>
            {carreras.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filtroAnio}
            onChange={(e) => setFiltroAnio(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700"
          >
            <option value="todos">Todos los Años</option>
            <option value="1">1er Año</option>
            <option value="2">2do Año</option>
            <option value="3">3er Año</option>
          </select>
        </div>

        <div>
          <select
            value={filtroTurno}
            onChange={(e) => setFiltroTurno(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700"
          >
            <option value="">Todos los Turnos</option>
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
            <option value="Noche">Noche</option>
            <option value="Sábado">Sábado</option>
          </select>
        </div>
      </div>

      {/* Tabla de Estudiantes */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider">
                <th className="p-3.5">Código</th>
                <th className="p-3.5">Estudiante</th>
                <th className="p-3.5">CI</th>
                <th className="p-3.5">Carrera</th>
                <th className="p-3.5">Año / Turno</th>
                <th className="p-3.5">Arancel Matrícula</th>
                <th className="p-3.5">Pensión Mensual</th>
                <th className="p-3.5">Plan Anual</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {estudiantesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No se encontraron estudiantes registrados con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                estudiantesFiltrados.map((est) => {
                  const car = carreras.find(c => c.id === est.carreraId);
                  const costoMat = est.montoMatriculaFinalBs ?? est.costoMatriculaBs ?? 300;
                  const costoMen = est.montoMensualidadFinalBs ?? est.costoMensualidadBs ?? 380;
                  const totalGes = est.montoTotalGestionBs ?? (costoMat + (costoMen * 10) + 50);

                  return (
                    <tr key={est.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-mono font-bold text-blue-900">
                        {est.codigo}
                      </td>
                      <td className="p-3.5">
                        <strong className="text-slate-900 font-bold block">
                          {est.apellidos}, {est.nombres}
                        </strong>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {est.telefono || est.email || 'Sin contacto'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700 font-bold">
                        {est.ci} {est.expedido}
                      </td>
                      <td className="p-3.5">
                        <span 
                          className="font-bold text-xs inline-block px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: `${car?.color || '#1E3A8A'}15`, color: car?.color || '#1E3A8A' }}
                        >
                          {car?.nombre || 'Carrera Técnica'}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-800">
                        <span className="font-bold block">{est.anioActual || 1}° Año</span>
                        <span className="text-[10px] text-slate-500">{est.turno}</span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {costoMat} Bs
                        {est.descuentoMatriculaBs ? (
                          <span className="text-[10px] text-emerald-600 block">(-{est.descuentoMatriculaBs} Bs desc)</span>
                        ) : null}
                      </td>
                      <td className="p-3.5 font-bold text-blue-900">
                        {costoMen} Bs/mes
                        <span className="text-[10px] text-slate-400 block font-normal">(10 cuotas)</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-black text-slate-900 block">{totalGes.toLocaleString()} Bs</span>
                        {est.tipoDescuento && est.tipoDescuento !== 'Ninguno' && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-800 px-1.5 py-0.5 rounded font-bold border border-indigo-200">
                            {est.tipoDescuento}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Imprimir Boleta Oficial Alumno y Empresa */}
                          <button
                            onClick={() => {
                              setBoletaEstudianteSeleccionado(est);
                              setModalBoletaAbierto(true);
                            }}
                            title="Imprimir Boleta Oficial de Matrícula (Copia Estudiante y Empresa)"
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg transition cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Ver e Imprimir Kárdex Financiero (Plan 10 Cuotas) */}
                          <button
                            onClick={() => {
                              setKardexEstudianteSeleccionado(est);
                              setModalKardexAbierto(true);
                            }}
                            title="Ver e Imprimir Kárdex Financiero Oficial (Plan 10 Cuotas y Pagos)"
                            className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white rounded-lg transition cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Ver Boletín Oficial de Notas */}
                          <button
                            onClick={() => onVerBoletin(est.id)}
                            title="Ver Boletín Oficial de Calificaciones Anuales"
                            className="p-1.5 bg-blue-50 text-blue-800 hover:bg-blue-900 hover:text-white rounded-lg transition cursor-pointer"
                          >
                            <Award className="w-4 h-4" />
                          </button>

                          {/* Editar */}
                          <button
                            onClick={() => abrirEditarModal(est)}
                            title="Editar datos del estudiante"
                            className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Eliminar */}
                          <button
                            onClick={() => setIdParaEliminar(est.id)}
                            title="Dar de baja estudiante"
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: FORMULARIO DE MATRÍCULA CON COSTOS, DESCUENTOS Y PAGO INICIAL     */}
      {/* ========================================================================= */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-auto">
            
            {/* Cabecera del modal */}
            <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight">
                  {estudianteEditando ? 'Editar Matrícula y Aranceles' : 'Inscripción y Matrícula Oficial'}
                </h3>
                <p className="text-xs text-blue-200">
                  Régimen Anualizado (3 Años) • Aranceles y Plan de 10 Cuotas Anuales
                </p>
              </div>
              <button 
                onClick={() => setModalAbierto(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {matriculaExitosa && estudianteRecienInscrito ? (
              <div className="p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900">
                    ¡Matrícula Registrada con Éxito!
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    El estudiante ha sido registrado con su plan oficial de aranceles y 10 cuotas anuales.
                  </p>
                </div>

                {/* Resumen del estudiante registrado */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Estudiante:</span>
                    <strong className="text-slate-950 font-bold">
                      {estudianteRecienInscrito.apellidos.toUpperCase()}, {estudianteRecienInscrito.nombres}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Código y CI:</span>
                    <strong className="text-blue-900 font-mono font-bold">
                      {estudianteRecienInscrito.codigo} (CI: {estudianteRecienInscrito.ci} {estudianteRecienInscrito.expedido})
                    </strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Carrera Técnica:</span>
                    <strong className="text-slate-900">
                      {carreras.find(c => c.id === estudianteRecienInscrito.carreraId)?.nombre || 'Carrera Técnica'} ({estudianteRecienInscrito.anioActual}° Año)
                    </strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Arancel Matrícula:</span>
                    <span className="text-slate-900 font-bold">
                      {estudianteRecienInscrito.montoMatriculaFinalBs ?? 300} Bs
                      {estudianteRecienInscrito.descuentoMatriculaBs ? (
                        <span className="text-emerald-700 ml-1.5 text-[11px] font-semibold">
                          (Rebaja: -{estudianteRecienInscrito.descuentoMatriculaBs} Bs)
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Pensión Mensual:</span>
                    <span className="text-blue-900 font-bold">
                      {estudianteRecienInscrito.montoMensualidadFinalBs ?? 380} Bs / mes (Plan 10 Cuotas)
                      {estudianteRecienInscrito.tipoDescuento && estudianteRecienInscrito.tipoDescuento !== 'Ninguno' && (
                        <span className="ml-1.5 bg-indigo-100 text-indigo-900 text-[10px] px-1.5 py-0.5 rounded font-bold">
                          {estudianteRecienInscrito.tipoDescuento}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Abono Inicial en Caja:</span>
                    <strong className="text-emerald-700 font-black">
                      {estudianteRecienInscrito.montoPagadoInicialBs ?? 0} Bs ({estudianteRecienInscrito.nroReciboInicial || 'REC-2026'})
                    </strong>
                  </div>
                </div>

                {/* BOTONES SOLICITADOS POR EL USUARIO: IMPRIMIR BOLETA Y KARDEX FINANCIERO */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBoletaEstudianteSeleccionado(estudianteRecienInscrito);
                      setModalBoletaAbierto(true);
                    }}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-900/30 flex items-center justify-center gap-2.5 transition cursor-pointer scale-100 hover:scale-[1.02] border-2 border-emerald-400"
                  >
                    <Printer className="w-5 h-5 text-white shrink-0" />
                    <span className="text-center font-black">
                      IMPRIMIR BOLETA DE INSCRIPCIÓN Y ARANCELES (COPIA ALUMNO Y EMPRESA)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setKardexEstudianteSeleccionado(estudianteRecienInscrito);
                      setModalKardexAbierto(true);
                    }}
                    className="w-full py-3.5 px-4 bg-blue-900 hover:bg-blue-800 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer border border-blue-700"
                  >
                    <FileText className="w-5 h-5 text-amber-300 shrink-0" />
                    <span>VER E IMPRIMIR KÁRDEX FINANCIERO CON PLAN DE 10 CUOTAS</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={abrirNuevoModal}
                      className="flex-1 py-2.5 px-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>+ Inscribir Otro Alumno</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalAbierto(false)}
                      className="flex-1 py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer"
                    >
                      Cerrar y Volver
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
                
                {/* 1. Datos Personales */}
                <div className="border-b border-slate-200 pb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-900" />
                    <span>1. Datos del Estudiante</span>
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Nombres *
                      </label>
                      <input
                        type="text"
                        required
                        value={nombres}
                        onChange={(e) => setNombres(e.target.value)}
                        placeholder="ej: Alejandro David"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Apellidos *
                      </label>
                      <input
                        type="text"
                        required
                        value={apellidos}
                        onChange={(e) => setApellidos(e.target.value)}
                        placeholder="ej: Fernandez Torrico"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Cédula de Identidad (CI) *
                      </label>
                      <input
                        type="text"
                        required
                        value={ci}
                        onChange={(e) => setCi(e.target.value)}
                        placeholder="ej: 8745129"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Expedido *
                      </label>
                      <select
                        value={expedido}
                        onChange={(e) => setExpedido(e.target.value as ExpedidoBolivia)}
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="CB">CB (Cochabamba)</option>
                        <option value="LP">LP (La Paz)</option>
                        <option value="SC">SC (Santa Cruz)</option>
                        <option value="OR">OR (Oruro)</option>
                        <option value="PT">PT (Potosí)</option>
                        <option value="TJ">TJ (Tarija)</option>
                        <option value="CH">CH (Chuquisaca)</option>
                        <option value="BE">BE (Beni)</option>
                        <option value="PD">PD (Pando)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Programa Académico */}
                <div className="border-b border-slate-200 pb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-900" />
                    <span>2. Programa Académico (Régimen Anualizado)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Carrera Profesional *
                      </label>
                      <select
                        value={carreraId}
                        onChange={(e) => {
                          const idCar = e.target.value;
                          setCarreraId(idCar);
                          actualizarCostosSegunCarrera(idCar);
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800"
                      >
                        {carreras.map(c => (
                          <option key={c.id} value={c.id}>{c.nombre} (3 Años)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Año de Formación *
                      </label>
                      <select
                        value={anioActual}
                        onChange={(e) => setAnioActual(Number(e.target.value) as 1 | 2 | 3)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-blue-900"
                      >
                        <option value={1}>1er Año</option>
                        <option value={2}>2do Año</option>
                        <option value={3}>3er Año</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Turno *
                      </label>
                      <select
                        value={turno}
                        onChange={(e) => setTurno(e.target.value as TurnoEstudio)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                      >
                        <option value="Mañana">Turno Mañana (08:00 - 12:00)</option>
                        <option value="Tarde">Turno Tarde (14:00 - 18:00)</option>
                        <option value="Noche">Turno Noche (18:30 - 22:00)</option>
                        <option value="Sábado">Sábado Intensivo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Teléfono / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="ej: 72234567"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. PARÁMETROS ECONÓMICOS: MATRÍCULA, DESCUENTOS Y PLAN DE 10 CUOTAS */}
                <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/90 space-y-3">
                  <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-700" />
                      <span>3. Aranceles, Descuentos y Plan de 10 Cuotas Anuales</span>
                    </h4>
                    <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded">
                      R.M. No. 0397/2024
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Costo Matrícula Base (Bs)
                      </label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={costoMatricula}
                        onChange={(e) => setCostoMatricula(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Pensión Mensual Base (Bs)
                      </label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={costoMensualidad}
                        onChange={(e) => setCostoMensualidad(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-blue-900"
                      />
                      <span className="text-[9px] text-slate-500">Plan 10 Cuotas/Año</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Otros Costos (Bs)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={otrosCostos}
                        onChange={(e) => setOtrosCostos(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                      />
                      <span className="text-[9px] text-slate-500">Seguro y carnet</span>
                    </div>
                  </div>

                  {/* Beneficios y Descuentos */}
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-indigo-900 uppercase mb-1">
                        Tipo de Descuento
                      </label>
                      <select
                        value={tipoDescuento}
                        onChange={(e) => handleCambioTipoDescuento(e.target.value as TipoDescuento)}
                        className="w-full px-2.5 py-1.5 bg-indigo-50/60 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-950"
                      >
                        <option value="Ninguno">Ninguno (Tarifa Regular)</option>
                        <option value="Pronto Pago">Pronto Pago (10% en mensualidad)</option>
                        <option value="Beca Excelencia">Beca Excelencia (50% matrícula y pensión)</option>
                        <option value="Descuento Hermanos">Descuento Hermanos (15% en mensualidad)</option>
                        <option value="Convenio Institucional">Convenio Institucional (20% en mensualidad)</option>
                        <option value="Personalizado">Personalizado (Monto Manual)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Rebaja a Matrícula (Bs)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={costoMatricula}
                        value={descuentoMatricula}
                        onChange={(e) => setDescuentoMatricula(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-emerald-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Rebaja Mensualidad (Bs)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={costoMensualidad}
                        value={descuentoMensualidad}
                        onChange={(e) => setDescuentoMensualidad(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-emerald-700"
                      />
                    </div>
                  </div>

                  {/* Resumen del Plan Económico */}
                  <div className="bg-emerald-950 text-white p-3 rounded-xl flex flex-wrap justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] text-emerald-300 uppercase block font-bold">Matrícula Final:</span>
                      <strong className="text-sm font-black">{matriculaFinalCalculada} Bs</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-300 uppercase block font-bold">Pensión Final (x10):</span>
                      <strong className="text-sm font-black">{mensualidadFinalCalculada} Bs/mes</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-amber-300 uppercase block font-bold">Total Plan Gestión Anual:</span>
                      <strong className="text-base text-amber-300 font-black">{totalPlanAnualCalculado.toLocaleString()} Bs</strong>
                    </div>
                  </div>

                  {/* Liquidación del Pago Inicial en Caja */}
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-900 uppercase mb-1">
                        Abono Inicial en Caja (Bs) *
                      </label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={montoPagadoInicial}
                        onChange={(e) => setMontoPagadoInicial(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-emerald-50 border border-emerald-400 rounded-xl text-xs font-black text-emerald-900"
                      />
                      <span className="text-[9px] text-slate-500">
                        Saldo Matrícula: <strong className={saldoInicialCalculado > 0 ? 'text-amber-700' : 'text-emerald-700'}>{saldoInicialCalculado} Bs</strong>
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Método de Pago *
                      </label>
                      <select
                        value={metodoPagoInicial}
                        onChange={(e) => setMetodoPagoInicial(e.target.value as MetodoPago)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                      >
                        <option value="Efectivo">Efectivo</option>
                        <option value="QR Simple">QR Simple (Banca Móvil)</option>
                        <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                        <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                        <option value="Tigo Money">Tigo Money</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        N° Recibo Oficial *
                      </label>
                      <input
                        type="text"
                        required
                        value={nroReciboInicial}
                        onChange={(e) => setNroReciboInicial(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Observaciones / Notas de Kárdex
                  </label>
                  <textarea
                    rows={2}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Documentación entregada, convenios especiales o notas de kárdex..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setModalAbierto(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-black rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{estudianteEditando ? 'Guardar Cambios' : 'Confirmar Matrícula y Emitir Boleta'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CONFIRMAR ELIMINAR */}
      {idParaEliminar && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">¿Dar de baja al estudiante?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Se eliminará al estudiante y sus registros de kárdex y calificaciones asociadas.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIdParaEliminar(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onEliminarEstudiante(idParaEliminar);
                  setIdParaEliminar(null);
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                Sí, Dar de Baja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BOLETA OFICIAL DE MATRICULACIÓN E INSCRIPCIÓN (COPIA ALUMNO Y EMPRESA) */}
      {modalBoletaAbierto && boletaEstudianteSeleccionado && (
        <BoletaMatriculaEstudianteModal
          estudiante={boletaEstudianteSeleccionado}
          carrera={carreras.find(c => c && c.id === boletaEstudianteSeleccionado.carreraId)}
          materias={materias}
          institutoConfig={institutoConfig}
          customLogoUrl={customLogoUrl}
          costosCarrera={costosCarreras}
          onClose={() => {
            setModalBoletaAbierto(false);
            setBoletaEstudianteSeleccionado(null);
          }}
        />
      )}

      {/* MODAL: KÁRDEX FINANCIERO OFICIAL (PLAN 10 CUOTAS Y PAGOS) */}
      {modalKardexAbierto && kardexEstudianteSeleccionado && (
        <KardexFinancieroModal
          estudiante={kardexEstudianteSeleccionado}
          carrera={carreras.find(c => c && c.id === kardexEstudianteSeleccionado.carreraId) || carreras[0]}
          cuotas={pagosCuotas.filter(p => p.estudianteId === kardexEstudianteSeleccionado.id && p.tipoPago === 'Cuota Mensual')}
          institutoConfig={institutoConfig}
          customLogoUrl={customLogoUrl}
          costosCarreras={costosCarreras}
          onClose={() => {
            setModalKardexAbierto(false);
            setKardexEstudianteSeleccionado(null);
          }}
          onRegistrarPagoCuota={onRegistrarPagoCuota}
        />
      )}
    </div>
  );
};
