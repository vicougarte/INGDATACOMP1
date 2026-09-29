import React, { useState, useMemo } from 'react';
import { 
  Carrera, 
  Estudiante, 
  CostoCarrera, 
  PagoCuotaEstudiante, 
  TransaccionPago, 
  MetodoPago, 
  EstadoPagoCuota,
  ConfiguracionInstituto
} from '../types';
import { 
  DollarSign, 
  CreditCard, 
  Receipt, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Printer, 
  Download, 
  Calendar, 
  User, 
  BookOpen, 
  QrCode, 
  RefreshCw, 
  Edit3, 
  Check, 
  X, 
  Plus, 
  FileText, 
  ShieldCheck,
  Building2,
  TrendingUp,
  Percent,
  Layers,
  ArrowRight
} from 'lucide-react';
import { MESES_10_CUOTAS, COSTOS_CARRERAS_INICIALES } from '../data/initialData';
import { IngDataCompLogo } from './IngDataCompLogo';
import { KardexFinancieroModal } from './KardexFinancieroModal';
import { ModalRegistrarPagoPorCuota, ReciboMultipleInfo } from './ModalRegistrarPagoPorCuota';
import { ModalReciboOficialCaja } from './ModalReciboOficialCaja';

interface PagosCuotasViewProps {
  estudiantes: Estudiante[];
  carreras: Carrera[];
  costosCarreras: CostoCarrera[];
  pagosCuotas: PagoCuotaEstudiante[];
  institutoConfig?: ConfiguracionInstituto;
  customLogoUrl?: string | null;
  onActualizarCostosCarrera: (costos: CostoCarrera[], actualizarCuotasPendientes?: boolean) => void;
  onRegistrarPagoCuota: (pagoActualizado: PagoCuotaEstudiante, nuevaTransaccion: TransaccionPago) => void;
  onRegistrarPagosMultiples?: (cuotasActualizadas: PagoCuotaEstudiante[], nuevasTransacciones: TransaccionPago[]) => void;
  onGuardarEnHoja?: () => Promise<void> | void;
  isSavingSheet?: boolean;
  spreadsheetId?: string | null;
  spreadsheetUrl?: string | null;
  user?: any;
  onAbrirModalConexion?: () => void;
  lastSyncTime?: string | null;
  onRestaurarCostosPorDefecto?: () => void;
}

export const PagosCuotasView: React.FC<PagosCuotasViewProps> = ({
  estudiantes,
  carreras,
  costosCarreras,
  pagosCuotas,
  institutoConfig,
  customLogoUrl,
  onActualizarCostosCarrera,
  onRegistrarPagoCuota,
  onRegistrarPagosMultiples,
  onGuardarEnHoja,
  isSavingSheet = false,
  spreadsheetId,
  spreadsheetUrl,
  user,
  onAbrirModalConexion,
  lastSyncTime,
  onRestaurarCostosPorDefecto
}) => {
  // Pestaña activa dentro del módulo de finanzas: 'estudiantes' | 'matriz' | 'aranceles'
  const [subTab, setSubTab] = useState<'estudiantes' | 'matriz' | 'aranceles'>('estudiantes');

  // Mensajes de confirmación en tiempo real
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroCarrera, setFiltroCarrera] = useState('');
  const [filtroAnio, setFiltroAnio] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  // Estudiante seleccionado para su kárdex económico
  const [estudianteSeleccionadoId, setEstudianteSeleccionadoId] = useState<string>(
    estudiantes[0]?.id || ''
  );

  // Modal para registrar abono o cobro
  const [modalCobroAbierto, setModalCobroAbierto] = useState(false);
  const [cuotaParaCobro, setCuotaParaCobro] = useState<PagoCuotaEstudiante | null>(null);
  const [montoAbono, setMontoAbono] = useState<number>(0);
  const [metodoCobro, setMetodoCobro] = useState<MetodoPago>('Efectivo');
  const [nroReciboAbono, setNroReciboAbono] = useState<string>('');
  const [cajeroNombre, setCajeroNombre] = useState<string>('Caja Central');
  const [obsAbono, setObsAbono] = useState<string>('');

  // Modal Recibo Oficial de Caja Imprimible (Unificado para 1 o Múltiples Cuotas)
  const [reciboActivoParaImprimir, setReciboActivoParaImprimir] = useState<ReciboMultipleInfo | null>(null);

  // Modal Estado de Cuenta / Kárdex Económico Imprimible
  const [modalKardexImprimible, setModalKardexImprimible] = useState<boolean>(false);

  // Modal para Registro Directo de Pago por Número de Cuota (1 al 10)
  const [modalRegistroPorCuotaAbierto, setModalRegistroPorCuotaAbierto] = useState<boolean>(false);
  const [cuotaPreseleccionada, setCuotaPreseleccionada] = useState<number>(1);

  const handleAbrirRegistroPorCuota = (numCuota: number = 1, idEstudiante?: string) => {
    if (idEstudiante) {
      setEstudianteSeleccionadoId(idEstudiante);
    }
    setCuotaPreseleccionada(numCuota);
    setModalRegistroPorCuotaAbierto(true);
  };

  // Modal Edición de Aranceles por Carrera
  const [carreraEditandoCostos, setCarreraEditandoCostos] = useState<CostoCarrera | null>(null);
  const [editMatricula, setEditMatricula] = useState<number>(300);
  const [editPension, setEditPension] = useState<number>(380);
  const [editCuotas, setEditCuotas] = useState<number>(10);
  const [editOtros, setEditOtros] = useState<number>(50);
  const [editDescOtros, setEditDescOtros] = useState<string>('');
  const [actualizarAlumnosTarifa, setActualizarAlumnosTarifa] = useState<boolean>(true);

  // Estudiante actualmente activo en la vista individual
  const estudianteActivo = useMemo(() => {
    return estudiantes.find(e => e.id === estudianteSeleccionadoId) || estudiantes[0] || null;
  }, [estudiantes, estudianteSeleccionadoId]);

  const carreraEstudianteActivo = useMemo(() => {
    if (!estudianteActivo) return null;
    return carreras.find(c => c.id === estudianteActivo.carreraId) || null;
  }, [carreras, estudianteActivo]);

  // Cuotas del estudiante activo (10 cuotas mensuales garantizadas)
  const cuotasEstudianteActivo = useMemo(() => {
    if (!estudianteActivo) return [];
    
    const cuotas = pagosCuotas.filter(p => p.estudianteId === estudianteActivo.id && p.tipoPago === 'Cuota Mensual');
    
    // Si no tiene registros en memoria, generarlos a partir del plan estándar
    if (cuotas.length === 0) {
      const costoC = costosCarreras.find(c => c.carreraId === estudianteActivo.carreraId) || costosCarreras[0];
      const cuotaBase = estudianteActivo.montoMensualidadFinalBs ?? costoC?.costoMensualidadBs ?? 380;
      
      const cuotasGeneradas: PagoCuotaEstudiante[] = MESES_10_CUOTAS.map(item => ({
        id: `pago-${estudianteActivo.id}-cuota-${item.numero}`,
        estudianteId: estudianteActivo.id,
        codigoEstudiante: estudianteActivo.codigo,
        nombreEstudiante: `${estudianteActivo.apellidos}, ${estudianteActivo.nombres}`,
        carreraId: estudianteActivo.carreraId,
        anio: estudianteActivo.anioActual || 1,
        gestion: '2026',
        tipoPago: 'Cuota Mensual' as const,
        numeroCuota: item.numero,
        mesCorrespondiente: item.mes,
        fechaVencimiento: item.fechaVencimiento,
        montoPactadoBs: cuotaBase,
        montoPagadoBs: 0,
        saldoPendienteBs: cuotaBase,
        estado: 'Pendiente' as EstadoPagoCuota,
        transacciones: []
      }));
      return cuotasGeneradas;
    }

    return cuotas.sort((a, b) => (a.numeroCuota || 0) - (b.numeroCuota || 0));
  }, [pagosCuotas, estudianteActivo, costosCarreras]);

  // Totales y estadísticas del estudiante activo
  const resumenEstudianteActivo = useMemo(() => {
    if (!estudianteActivo) {
      return { totalPactado: 0, totalPagado: 0, saldoPendiente: 0, cuotasCanceladas: 0, cuotasParciales: 0, cuotasPendientes: 0 };
    }

    const totalPactado = cuotasEstudianteActivo.reduce((acc, c) => acc + c.montoPactadoBs, 0);
    const totalPagado = cuotasEstudianteActivo.reduce((acc, c) => acc + c.montoPagadoBs, 0);
    const saldoPendiente = totalPactado - totalPagado;

    const cuotasCanceladas = cuotasEstudianteActivo.filter(c => c.estado === 'Cancelado').length;
    const cuotasParciales = cuotasEstudianteActivo.filter(c => c.estado === 'Parcial').length;
    const cuotasPendientes = cuotasEstudianteActivo.filter(c => c.estado === 'Pendiente' || c.estado === 'Vencido').length;

    return {
      totalPactado,
      totalPagado,
      saldoPendiente,
      cuotasCanceladas,
      cuotasParciales,
      cuotasPendientes
    };
  }, [estudianteActivo, cuotasEstudianteActivo]);

  // Estadísticas institucionales globales
  const statsGlobales = useMemo(() => {
    let totalEsperado = 0;
    let totalCobrado = 0;
    let totalAlumnosConSaldo = 0;

    estudiantes.forEach(est => {
      const cuotas = pagosCuotas.filter(p => p.estudianteId === est.id && p.tipoPago === 'Cuota Mensual');
      if (cuotas.length > 0) {
        const pactado = cuotas.reduce((acc, c) => acc + c.montoPactadoBs, 0);
        const pagado = cuotas.reduce((acc, c) => acc + c.montoPagadoBs, 0);
        totalEsperado += pactado;
        totalCobrado += pagado;
        if (pactado > pagado) totalAlumnosConSaldo++;
      } else {
        const costoC = costosCarreras.find(c => c.carreraId === est.carreraId) || costosCarreras[0];
        const cuotaBase = est.montoMensualidadFinalBs ?? costoC?.costoMensualidadBs ?? 380;
        totalEsperado += cuotaBase * 10;
        totalAlumnosConSaldo++;
      }
    });

    const porcentajeRecaudado = totalEsperado > 0 ? Math.round((totalCobrado / totalEsperado) * 100) : 0;

    return {
      totalEsperado,
      totalCobrado,
      saldoPorCobrar: totalEsperado - totalCobrado,
      porcentajeRecaudado,
      totalAlumnosConSaldo
    };
  }, [estudiantes, pagosCuotas, costosCarreras]);

  // Estudiantes filtrados para la lista de selección y matriz
  const estudiantesFiltrados = useMemo(() => {
    return estudiantes.filter(e => {
      const txt = `${e.nombres} ${e.apellidos} ${e.ci} ${e.codigo}`.toLowerCase();
      const matchBusqueda = txt.includes(busqueda.toLowerCase());
      const matchCarrera = !filtroCarrera || e.carreraId === filtroCarrera;
      const matchAnio = filtroAnio === 'todos' || String(e.anioActual || 1) === filtroAnio;

      if (!matchBusqueda || !matchCarrera || !matchAnio) return false;

      if (filtroEstado !== 'todos') {
        const cuotas = pagosCuotas.filter(p => p.estudianteId === e.id);
        const tieneSaldo = cuotas.some(c => c.saldoPendienteBs > 0);
        if (filtroEstado === 'al_dia' && tieneSaldo) return false;
        if (filtroEstado === 'con_saldo' && !tieneSaldo) return false;
      }

      return true;
    });
  }, [estudiantes, busqueda, filtroCarrera, filtroAnio, filtroEstado, pagosCuotas]);

  // Abrir modal de cobro para una cuota específica
  const handleAbrirCobro = (cuota: PagoCuotaEstudiante) => {
    setCuotaParaCobro(cuota);
    setMontoAbono(cuota.saldoPendienteBs);
    setMetodoCobro('Efectivo');
    const correlativo = Math.floor(1000 + Math.random() * 9000);
    setNroReciboAbono(`REC-2026-${correlativo}`);
    setObsAbono(`Abono cuota N° ${cuota.numeroCuota} (${cuota.mesCorrespondiente})`);
    setModalCobroAbierto(true);
  };

  // Guardar abono realizado
  const handleConfirmarCobro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuotaParaCobro || !estudianteActivo) return;

    const monto = Number(montoAbono);
    if (monto <= 0) {
      alert('El monto debe ser mayor a 0 Bs.');
      return;
    }

    const nuevoTotalPagado = cuotaParaCobro.montoPagadoBs + monto;
    const nuevoSaldo = Math.max(0, cuotaParaCobro.montoPactadoBs - nuevoTotalPagado);
    const nuevoEstado: EstadoPagoCuota = nuevoSaldo === 0 ? 'Cancelado' : 'Parcial';

    const fechaHoy = new Date().toISOString().slice(0, 10);
    const horaHoy = new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });

    const nuevaTx: TransaccionPago = {
      id: `tx-${Date.now()}`,
      fecha: fechaHoy,
      hora: horaHoy,
      montoBs: monto,
      metodoPago: metodoCobro,
      nroRecibo: nroReciboAbono || `REC-2026-${Date.now().toString().slice(-4)}`,
      cajero: cajeroNombre || 'Caja Central',
      observaciones: obsAbono
    };

    const cuotaActualizada: PagoCuotaEstudiante = {
      ...cuotaParaCobro,
      montoPagadoBs: nuevoTotalPagado,
      saldoPendienteBs: nuevoSaldo,
      estado: nuevoEstado,
      ultimoNroRecibo: nuevaTx.nroRecibo,
      ultimaFechaPago: fechaHoy,
      ultimoMetodoPago: metodoCobro,
      transacciones: [...(cuotaParaCobro.transacciones || []), nuevaTx]
    };

    onRegistrarPagoCuota(cuotaActualizada, nuevaTx);
    setModalCobroAbierto(false);

    // Abrir automáticamente el recibo oficial imprimible para entregar al alumno
    if (carreraEstudianteActivo) {
      setReciboActivoParaImprimir({
        nroRecibo: nuevaTx.nroRecibo,
        fecha: nuevaTx.fecha,
        hora: nuevaTx.hora || horaHoy,
        cajero: nuevaTx.cajero || cajeroNombre || 'Caja Central',
        metodoPago: nuevaTx.metodoPago,
        estudiante: estudianteActivo,
        carrera: carreraEstudianteActivo,
        concepto: `Pensión Mensual • Cuota N° ${cuotaActualizada.numeroCuota || 1} (${cuotaActualizada.mesCorrespondiente || 'Mensualidad'})`,
        totalAbonado: Number(nuevaTx.montoBs || 0),
        cuotasInfo: [{
          numeroCuota: cuotaActualizada.numeroCuota || 1,
          mes: cuotaActualizada.mesCorrespondiente || `Cuota ${cuotaActualizada.numeroCuota || 1}`,
          montoAbonado: Number(nuevaTx.montoBs || 0),
          saldoRestante: Number(cuotaActualizada.saldoPendienteBs || 0),
          estadoFinal: String(cuotaActualizada.estado || 'Cancelado')
        }],
        observaciones: nuevaTx.observaciones || ''
      });
    }
  };

  // Reimprimir recibo oficial de una cuota ya cancelada o abonada
  const handleReimprimirRecibo = (cuota: PagoCuotaEstudiante) => {
    const est = estudiantes.find(e => e.id === cuota.estudianteId) || estudianteActivo;
    const car = carreras.find(c => c.id === cuota.carreraId) || carreraEstudianteActivo;
    if (!est || !car) return;

    const ultimaTx = cuota.transacciones && cuota.transacciones.length > 0
      ? cuota.transacciones[cuota.transacciones.length - 1]
      : null;

    setReciboActivoParaImprimir({
      nroRecibo: cuota.ultimoNroRecibo || ultimaTx?.nroRecibo || `REC-2026-${cuota.id.slice(-4)}`,
      fecha: cuota.ultimaFechaPago || ultimaTx?.fecha || new Date().toISOString().slice(0, 10),
      hora: ultimaTx?.hora || '10:00',
      cajero: ultimaTx?.cajero || 'Caja Central',
      metodoPago: cuota.ultimoMetodoPago || ultimaTx?.metodoPago || 'Efectivo',
      estudiante: est,
      carrera: car,
      concepto: `Pensión Mensual • Cuota N° ${cuota.numeroCuota || 1} (${cuota.mesCorrespondiente || 'Mensualidad'})`,
      totalAbonado: Number(cuota.montoPagadoBs || 0),
      cuotasInfo: [{
        numeroCuota: cuota.numeroCuota || 1,
        mes: cuota.mesCorrespondiente || `Cuota ${cuota.numeroCuota || 1}`,
        montoAbonado: Number(cuota.montoPagadoBs || 0),
        saldoRestante: Number(cuota.saldoPendienteBs || 0),
        estadoFinal: String(cuota.estado || 'Cancelado')
      }],
      observaciones: ultimaTx?.observaciones || `Comprobante de pago cuota N° ${cuota.numeroCuota || 1}`
    });
  };

  // Abrir edición de aranceles de una carrera
  const handleEditarCostos = (costo: CostoCarrera) => {
    setCarreraEditandoCostos(costo);
    setEditMatricula(costo.costoMatriculaBs);
    setEditPension(costo.costoMensualidadBs);
    setEditCuotas(costo.numeroCuotas || 10);
    setEditOtros(costo.otrosCostosBs);
    setEditDescOtros(costo.descripcionOtrosCostos || 'Seguro estudiantil y carnet institucional');
  };

  const handleGuardarCostos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!carreraEditandoCostos) return;

    const mat = Number(editMatricula);
    const pen = Number(editPension);
    const numC = Number(editCuotas) || 10;
    const otr = Number(editOtros);

    const carreraExiste = costosCarreras.some(c => 
      c.carreraId === carreraEditandoCostos.carreraId || 
      (c.carreraCodigo && carreraEditandoCostos.carreraCodigo && c.carreraCodigo.toUpperCase() === carreraEditandoCostos.carreraCodigo.toUpperCase())
    );

    let actualizados: CostoCarrera[];
    if (carreraExiste) {
      actualizados = costosCarreras.map(c => {
        const match = c.carreraId === carreraEditandoCostos.carreraId ||
          (c.carreraCodigo && carreraEditandoCostos.carreraCodigo && c.carreraCodigo.toUpperCase() === carreraEditandoCostos.carreraCodigo.toUpperCase());
        if (match) {
          return {
            ...c,
            costoMatriculaBs: mat,
            costoMensualidadBs: pen,
            numeroCuotas: numC,
            otrosCostosBs: otr,
            descripcionOtrosCostos: editDescOtros,
            totalAnualBs: mat + (pen * numC) + otr
          };
        }
        return c;
      });
    } else {
      actualizados = [
        ...costosCarreras,
        {
          ...carreraEditandoCostos,
          costoMatriculaBs: mat,
          costoMensualidadBs: pen,
          numeroCuotas: numC,
          otrosCostosBs: otr,
          descripcionOtrosCostos: editDescOtros,
          totalAnualBs: mat + (pen * numC) + otr
        }
      ];
    }

    onActualizarCostosCarrera(actualizados, actualizarAlumnosTarifa);
    setCarreraEditandoCostos(null);
    setMensajeExito(`✓ Aranceles de "${carreraEditandoCostos.carreraNombre}" guardados y actualizados en tiempo real: Matrícula ${mat} Bs, Pensión ${pen} Bs/mes (${numC} cuotas), Otros ${otr} Bs.`);
    setTimeout(() => setMensajeExito(null), 6000);
  };

  // Sincronizar o guardar en la hoja de cálculo con feedback en tiempo real
  const handleSincronizarHoja = async () => {
    setMensajeError(null);
    if (!spreadsheetId || !user) {
      if (onAbrirModalConexion) {
        onAbrirModalConexion();
      }
      setMensajeExito('Los costos modificados están guardados de forma segura en tu navegador. Para sincronizarlos con tu Google Sheets en la nube, inicia sesión con Google.');
      setTimeout(() => setMensajeExito(null), 8000);
      return;
    }

    if (onGuardarEnHoja) {
      try {
        await onGuardarEnHoja();
        setMensajeExito('✓ ¡Hoja COSTOS_CARRERAS y PAGOS_10_CUOTAS sincronizada y guardada exitosamente en Google Sheets!');
        setTimeout(() => setMensajeExito(null), 6000);
      } catch (err: any) {
        setMensajeError(err.message || 'Error al guardar en Google Sheets.');
        setTimeout(() => setMensajeError(null), 6000);
      }
    }
  };

  const exportarCarteraCSV = () => {
    const cabeceras = ['Codigo,Estudiante,CI,Carrera,Ano_Estudio,Turno,Total_Pactado_Bs,Total_Pagado_Bs,Saldo_Pendiente_Bs,Cuotas_Al_Dia'];
    const filas = estudiantesFiltrados.map(e => {
      const c = carreras.find(car => car.id === e.carreraId)?.nombre || '';
      const cuotas = pagosCuotas.filter(p => p.estudianteId === e.id && p.tipoPago === 'Cuota Mensual');
      const pactado = cuotas.reduce((acc, item) => acc + item.montoPactadoBs, 0);
      const pagado = cuotas.reduce((acc, item) => acc + item.montoPagadoBs, 0);
      const canceladas = cuotas.filter(item => item.estado === 'Cancelado').length;
      return `"${e.codigo}","${e.apellidos}, ${e.nombres}","${e.ci}","${c}","${e.anioActual || 1}° Año","${e.turno}","${pactado}","${pagado}","${pactado - pagado}","${canceladas}/10"`;
    });

    const blob = new Blob([cabeceras.concat(filas).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Cartera_10_Cuotas_ING_DATA_COMP_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal del Módulo de Finanzas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-emerald-500 text-slate-950 rounded-xl font-black shadow-md">
              <DollarSign className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Gestión de Costos, Aranceles y Plan de 10 Cuotas Anuales
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-blue-200">
            Control arancelario oficial de las 4 Carreras Técnicas (R.M. No. 0397/2024) y kárdex económico individual.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* BOTÓN SOLICITADO: REGISTRAR PAGO DE CUOTA (1 AL 10) */}
          <button
            onClick={() => handleAbrirRegistroPorCuota(1)}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-950/40 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Registrar Pago de Cuota (1 al 10)</span>
          </button>

          {onGuardarEnHoja && (
            <button
              onClick={handleSincronizarHoja}
              disabled={isSavingSheet}
              title="Guardar y sincronizar costos y pagos en las pestañas COSTOS_CARRERAS y PAGOS_10_CUOTAS de Google Sheets"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-2 transition disabled:opacity-50 shadow-md cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSavingSheet ? 'animate-spin' : ''}`} />
              <span>{isSavingSheet ? 'Sincronizando con Sheets...' : 'Sincronizar con Google Sheets'}</span>
            </button>
          )}

          <button
            onClick={exportarCarteraCSV}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-white/20 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-200" />
            <span>Exportar Cartera CSV</span>
          </button>
        </div>
      </div>

      {/* Banner de Feedback en Tiempo Real */}
      {mensajeExito && (
        <div className="bg-emerald-50 border-2 border-emerald-500/80 text-emerald-950 p-4 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{mensajeExito}</span>
          </div>
          <button 
            onClick={() => setMensajeExito(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {mensajeError && (
        <div className="bg-amber-50 border-2 border-amber-500/80 text-amber-950 p-4 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{mensajeError}</span>
          </div>
          <button 
            onClick={() => setMensajeError(null)}
            className="text-amber-700 hover:text-amber-950 p-1 cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tarjetas de Indicadores Globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Proyección Anual</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {statsGlobales.totalEsperado.toLocaleString()} Bs
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Presupuesto total en las 4 carreras
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Total Cobrado</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">
            {statsGlobales.totalCobrado.toLocaleString()} Bs
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
            <Percent className="w-3 h-3" />
            <span>{statsGlobales.porcentajeRecaudado}% Recaudado a la fecha</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Saldo por Cobrar</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600">
            {statsGlobales.saldoPorCobrar.toLocaleString()} Bs
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Pendiente en cuotas futuras y mora
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Aranceles Carrera</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-900">
            4 Carreras
          </div>
          <span className="text-[10px] text-indigo-700 font-bold">
            10 Cuotas/Año • R.M. No. 0397/2024
          </span>
        </div>
      </div>

      {/* Navegación por Sub-Pestañas */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('estudiantes')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
            subTab === 'estudiantes'
              ? 'bg-blue-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Kárdex Económico por Estudiante</span>
        </button>

        <button
          onClick={() => setSubTab('matriz')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
            subTab === 'matriz'
              ? 'bg-blue-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Matriz General de las 10 Cuotas</span>
        </button>

        <button
          onClick={() => setSubTab('aranceles')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
            subTab === 'aranceles'
              ? 'bg-blue-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Aranceles y Costos por Carrera (Hoja COSTOS_CARRERAS)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-PESTAÑA 1: KÁRDEX ECONÓMICO INDIVIDUAL POR ESTUDIANTE                */}
      {/* ========================================================================= */}
      {subTab === 'estudiantes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Columna Izquierda: Buscador y Lista de Estudiantes (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar estudiante por nombre, CI o código..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filtroCarrera}
                  onChange={(e) => setFiltroCarrera(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                >
                  <option value="">Todas Carreras</option>
                  {carreras.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>

                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                >
                  <option value="todos">Todos Estados</option>
                  <option value="con_saldo">Con Saldo Pendiente</option>
                  <option value="al_dia">Al Día (100% Cancelado)</option>
                </select>
              </div>
            </div>

            {/* Lista deslizable de alumnos */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden max-h-[600px] overflow-y-auto divide-y divide-slate-100">
              {estudiantesFiltrados.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No se encontraron estudiantes con los filtros seleccionados.
                </div>
              ) : (
                estudiantesFiltrados.map(est => {
                  const esActivo = est.id === estudianteSeleccionadoId;
                  const cNombre = carreras.find(car => car.id === est.carreraId)?.nombre || '';
                  const cuotasEst = pagosCuotas.filter(p => p.estudianteId === est.id && p.tipoPago === 'Cuota Mensual');
                  const pagadas = cuotasEst.filter(c => c.estado === 'Cancelado').length;

                  return (
                    <button
                      key={est.id}
                      onClick={() => setEstudianteSeleccionadoId(est.id)}
                      className={`w-full text-left p-3.5 transition flex items-center justify-between gap-3 cursor-pointer ${
                        esActivo ? 'bg-blue-50 border-l-4 border-blue-900' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-slate-400">{est.codigo}</span>
                          <strong className="text-xs text-slate-900 font-bold truncate block">
                            {est.apellidos}, {est.nombres}
                          </strong>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {cNombre} • {est.anioActual || 1}° Año
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full ${
                          pagadas === 10 ? 'bg-emerald-100 text-emerald-800' : pagadas > 0 ? 'bg-blue-100 text-blue-900' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {pagadas}/10 cuotas
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Columna Derecha: Detalle del Kárdex Económico y las 10 Cuotas (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {estudianteActivo && carreraEstudianteActivo ? (
              <>
                {/* Cabecera del Estudiante Activo */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                        {estudianteActivo.codigo}
                      </span>
                      <h3 className="text-lg font-black text-slate-950">
                        {estudianteActivo.apellidos.toUpperCase()}, {estudianteActivo.nombres}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      CI: <span className="font-mono font-bold text-slate-700">{estudianteActivo.ci} {estudianteActivo.expedido}</span> | Carrera: <strong className="text-slate-800">{carreraEstudianteActivo.nombre}</strong> ({estudianteActivo.anioActual || 1}° Año • {estudianteActivo.turno})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleAbrirRegistroPorCuota(1, estudianteActivo.id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>+ Pagar Cuota (1 al 10)</span>
                    </button>

                    <button
                      onClick={() => setModalKardexImprimible(true)}
                      className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Ver e Imprimir Kárdex Financiero</span>
                    </button>
                  </div>
                </div>

                {/* Resumen Financiero del Estudiante */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Plan 10 Cuotas</span>
                    <strong className="text-base sm:text-lg font-black text-slate-900 block mt-0.5">
                      {resumenEstudianteActivo.totalPactado.toLocaleString()} Bs
                    </strong>
                    <span className="text-[10px] text-slate-400">10 Cuotas Mensuales</span>
                  </div>

                  <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 text-center">
                    <span className="text-[10px] font-bold uppercase text-emerald-800 block">Total Abonado</span>
                    <strong className="text-base sm:text-lg font-black text-emerald-700 block mt-0.5">
                      {resumenEstudianteActivo.totalPagado.toLocaleString()} Bs
                    </strong>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      {resumenEstudianteActivo.cuotasCanceladas} de 10 Canceladas
                    </span>
                  </div>

                  <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200 text-center">
                    <span className="text-[10px] font-bold uppercase text-amber-800 block">Saldo Pendiente</span>
                    <strong className="text-base sm:text-lg font-black text-amber-600 block mt-0.5">
                      {resumenEstudianteActivo.saldoPendiente.toLocaleString()} Bs
                    </strong>
                    <span className="text-[10px] text-amber-700 font-bold">
                      {resumenEstudianteActivo.saldoPendiente === 0 ? 'Al Día' : 'Por Liquidar'}
                    </span>
                  </div>
                </div>

                {/* Tabla de las 10 Cuotas Mensuales Oficiales */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center text-xs font-black uppercase tracking-wider">
                    <span>Plan Anual de las 10 Cuotas (Febrero a Noviembre 2026)</span>
                    <span className="text-amber-400 font-mono text-[11px]">Vencimiento: Día 10 de cada mes</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {cuotasEstudianteActivo.map((cuota) => {
                      const estaCancelado = cuota.estado === 'Cancelado';
                      const esParcial = cuota.estado === 'Parcial';

                      return (
                        <div key={cuota.id} className="p-4 hover:bg-slate-50/80 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                              estaCancelado ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              esParcial ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              C{cuota.numeroCuota}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-black text-slate-900">
                                  Cuota {cuota.numeroCuota} • {cuota.mesCorrespondiente}
                                </h4>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                  estaCancelado ? 'bg-emerald-100 text-emerald-800' :
                                  esParcial ? 'bg-amber-100 text-amber-800' :
                                  'bg-slate-100 text-slate-600'
                                }`}>
                                  {cuota.estado}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                <span>Vence: <strong className="text-slate-700">{cuota.fechaVencimiento || `2026-${String((cuota.numeroCuota || 1) + 1).padStart(2, '0')}-10`}</strong></span>
                                {cuota.ultimoNroRecibo && (
                                  <>
                                    <span>•</span>
                                    <span>Último Recibo: <strong className="font-mono text-blue-900">{cuota.ultimoNroRecibo}</strong> ({cuota.ultimaFechaPago})</span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Montos y Acciones */}
                          <div className="flex items-center gap-4 self-end sm:self-center">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block font-bold">Pactado: {cuota.montoPactadoBs} Bs</span>
                              <div className="text-xs font-black">
                                <span className="text-emerald-700">{cuota.montoPagadoBs} Bs Pagado</span>
                                {cuota.saldoPendienteBs > 0 && (
                                  <span className="text-amber-600 ml-1.5">| Saldo: {cuota.saldoPendienteBs} Bs</span>
                                )}
                              </div>
                            </div>

                            {cuota.saldoPendienteBs > 0 ? (
                              <button
                                onClick={() => handleAbrirCobro(cuota)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1 transition cursor-pointer"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>{esParcial ? 'Abonar Saldo' : 'Cobrar Cuota'}</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-emerald-700 text-xs font-bold bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Cancelado</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleReimprimirRecibo(cuota)}
                                  title="Ver e Imprimir Recibo Oficial de esta cuota"
                                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-900 text-blue-900 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-blue-200"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Recibo</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
                Selecciona un estudiante de la lista izquierda para visualizar su kárdex económico y plan de 10 cuotas.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-PESTAÑA 2: MATRIZ GENERAL DE LAS 10 CUOTAS                          */}
      {/* ========================================================================= */}
      {subTab === 'matriz' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Matriz General de Cartera (Cuotas 1 a 10 de las 4 Carreras)
              </h3>
              <p className="text-xs text-slate-500">
                Seguimiento visual del estado de pago mes a mes. Haz clic en cualquier cuota para abonar.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Cancelado</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Parcial</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span> Pendiente</span>
              </div>
              <button
                type="button"
                onClick={() => handleAbrirRegistroPorCuota(1)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Registrar Cobro</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                  <th className="p-2.5 rounded-l-lg">Código</th>
                  <th className="p-2.5">Estudiante</th>
                  <th className="p-2.5">Carrera</th>
                  <th className="p-2.5">Año</th>
                  <th className="p-2.5 text-center">C1</th>
                  <th className="p-2.5 text-center">C2</th>
                  <th className="p-2.5 text-center">C3</th>
                  <th className="p-2.5 text-center">C4</th>
                  <th className="p-2.5 text-center">C5</th>
                  <th className="p-2.5 text-center">C6</th>
                  <th className="p-2.5 text-center">C7</th>
                  <th className="p-2.5 text-center">C8</th>
                  <th className="p-2.5 text-center">C9</th>
                  <th className="p-2.5 text-center">C10</th>
                  <th className="p-2.5 text-right rounded-r-lg">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {estudiantesFiltrados.map((est) => {
                  const cNombre = carreras.find(car => car.id === est.carreraId)?.codigo || 'CARR';
                  const cuotasEst = pagosCuotas.filter(p => p.estudianteId === est.id && p.tipoPago === 'Cuota Mensual');

                  return (
                    <tr key={est.id} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-mono text-[11px] font-bold text-slate-500">{est.codigo}</td>
                      <td className="p-2.5 font-bold text-slate-900">{est.apellidos}, {est.nombres}</td>
                      <td className="p-2.5 font-bold text-blue-900">{cNombre}</td>
                      <td className="p-2.5">{est.anioActual || 1}° Año</td>

                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                        const cuota = cuotasEst.find(c => c.numeroCuota === num);
                        const estColor = cuota?.estado === 'Cancelado' ? 'bg-emerald-500 text-white' :
                                         cuota?.estado === 'Parcial' ? 'bg-amber-400 text-slate-950 font-bold' :
                                         'bg-slate-100 text-slate-400';

                        return (
                          <td key={num} className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleAbrirRegistroPorCuota(num, est.id)}
                              title={`Cuota ${num}: ${cuota?.estado || 'Pendiente'} (${cuota?.montoPagadoBs || 0}/${cuota?.montoPactadoBs || 380} Bs). Clic para cobrar.`}
                              className={`inline-block w-6 h-6 leading-6 rounded-md text-[10px] font-black cursor-pointer transition hover:scale-110 active:scale-95 shadow-xs ${estColor}`}
                            >
                              {num}
                            </button>
                          </td>
                        );
                      })}

                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => {
                            setEstudianteSeleccionadoId(est.id);
                            setSubTab('estudiantes');
                          }}
                          className="px-2.5 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Ver Kárdex
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-PESTAÑA 3: ARANCELES Y COSTOS POR CARRERA (PESTAÑA COSTOS_CARRERAS)  */}
      {/* ========================================================================= */}
      {subTab === 'aranceles' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-100 text-blue-900 rounded-lg">
                  <CreditCard className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Aranceles Oficiales por Carrera Técnica (Pestaña: COSTOS_CARRERAS)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Tarifas de Matrícula, 10 Cuotas de Pensión y Otros Aranceles según R.M. No. 0397/2024. Los cambios se registran en tiempo real en memoria y en Google Sheets.
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {onRestaurarCostosPorDefecto && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('¿Deseas restablecer los aranceles de las 4 carreras a sus valores oficiales iniciales (R.M. No. 0397/2024)?')) {
                      onRestaurarCostosPorDefecto();
                      setMensajeExito('✓ Aranceles restablecidos a los valores oficiales iniciales.');
                      setTimeout(() => setMensajeExito(null), 5000);
                    }
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs border border-slate-200"
                  title="Restablecer tarifas oficiales por defecto"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Restablecer Defectos</span>
                </button>
              )}

              {onGuardarEnHoja && (
                <button
                  onClick={handleSincronizarHoja}
                  disabled={isSavingSheet}
                  title="Guardar y registrar los costos modificados en Google Sheets"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSavingSheet ? 'animate-spin' : ''}`} />
                  <span>{isSavingSheet ? 'Guardando en Sheets...' : 'Actualizar Hoja COSTOS_CARRERAS'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {costosCarreras.map((costo) => {
              const car = carreras.find(c => c.id === costo.carreraId);

              return (
                <div key={costo.carreraId} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:border-blue-300 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-900 rounded">
                          {costo.carreraCodigo}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          En Tiempo Real
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-950 mt-1">
                        {costo.carreraNombre}
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        Resolución Ministerial R.M. No. 0397/2024 • 3 Años
                      </span>
                    </div>

                    <button
                      onClick={() => handleEditarCostos(costo)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-900 border border-blue-200 rounded-xl transition flex items-center gap-1.5 font-bold text-xs cursor-pointer shadow-xs"
                      title="Editar aranceles oficiales de esta carrera (Lápiz)"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Matrícula Anual</span>
                      <strong className="text-sm sm:text-base font-black text-slate-900 block mt-0.5">{costo.costoMatriculaBs} Bs</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Pensión Mensual</span>
                      <strong className="text-sm sm:text-base font-black text-blue-900 block mt-0.5">{costo.costoMensualidadBs} Bs</strong>
                      <span className="text-[9px] text-slate-400 font-bold">{costo.numeroCuotas || 10} Cuotas/Año</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Otros Costos</span>
                      <strong className="text-sm sm:text-base font-black text-slate-900 block mt-0.5">{costo.otrosCostosBs} Bs</strong>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-600 truncate max-w-[200px]" title={costo.descripcionOtrosCostos}>
                        {costo.descripcionOtrosCostos || 'Seguro estudiantil y carnet'}
                      </span>
                      <strong className="text-emerald-700 font-black text-sm shrink-0">
                        Total: {costo.totalAnualBs.toLocaleString()} Bs / Año
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleEditarCostos(costo)}
                      className="w-full py-2 bg-slate-100 hover:bg-blue-900 hover:text-white text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-200"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modificar Matrícula, Pensión y Otros Costos</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR COBRO / ABONO EN CAJA                                    */}
      {/* ========================================================================= */}
      {modalCobroAbierto && cuotaParaCobro && estudianteActivo && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Registrar Cobro en Caja</h3>
                  <p className="text-xs text-slate-500">
                    Cuota {cuotaParaCobro.numeroCuota} ({cuotaParaCobro.mesCorrespondiente}) • {estudianteActivo.apellidos}, {estudianteActivo.nombres}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setModalCobroAbierto(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarCobro} className="space-y-3.5">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-500 block">Saldo Actual de esta Cuota:</span>
                  <strong className="text-base font-black text-amber-700">{cuotaParaCobro.saldoPendienteBs} Bs</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Total Pactado:</span>
                  <strong className="text-slate-800">{cuotaParaCobro.montoPactadoBs} Bs</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Monto a Abonar (Bs) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={cuotaParaCobro.saldoPendienteBs}
                  required
                  value={montoAbono}
                  onChange={(e) => setMontoAbono(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-black text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-500">
                  Puedes abonar el total o un monto parcial (abono a cuenta).
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Método de Pago *
                  </label>
                  <select
                    value={metodoCobro}
                    onChange={(e) => setMetodoCobro(e.target.value as MetodoPago)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="QR Simple">QR Simple (Banca Móvil)</option>
                    <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                    <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                    <option value="Tigo Money">Tigo Money</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    N° de Recibo *
                  </label>
                  <input
                    type="text"
                    required
                    value={nroReciboAbono}
                    onChange={(e) => setNroReciboAbono(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Observaciones / Glosa
                </label>
                <input
                  type="text"
                  value={obsAbono}
                  onChange={(e) => setObsAbono(e.target.value)}
                  placeholder="Detalles del pago..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalCobroAbierto(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Emitir Recibo y Cobrar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECIBO OFICIAL DE CAJA (IMPRIMIBLE ALUMNO Y CAJA - UNIFICADO)     */}
      {/* ========================================================================= */}
      {reciboActivoParaImprimir && (
        <ModalReciboOficialCaja
          recibo={reciboActivoParaImprimir}
          institutoConfig={institutoConfig}
          customLogoUrl={customLogoUrl}
          onClose={() => setReciboActivoParaImprimir(null)}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: ESTADO DE CUENTA / KÁRDEX ECONÓMICO IMPRIMIBLE                    */}
      {/* ========================================================================= */}
      {modalKardexImprimible && estudianteActivo && carreraEstudianteActivo && (
        <KardexFinancieroModal
          estudiante={estudianteActivo}
          carrera={carreraEstudianteActivo}
          cuotas={cuotasEstudianteActivo}
          institutoConfig={institutoConfig}
          customLogoUrl={customLogoUrl}
          costosCarreras={costosCarreras}
          onClose={() => setModalKardexImprimible(false)}
          onRegistrarPagoCuota={onRegistrarPagoCuota}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR PAGO POR NÚMERO DE CUOTA (1 AL 10)                      */}
      {/* ========================================================================= */}
      {modalRegistroPorCuotaAbierto && (
        <ModalRegistrarPagoPorCuota
          estudiantes={estudiantes}
          carreras={carreras}
          costosCarreras={costosCarreras}
          pagosCuotas={pagosCuotas}
          estudianteInicialId={estudianteSeleccionadoId}
          cuotaInicialNumero={cuotaPreseleccionada}
          onClose={() => setModalRegistroPorCuotaAbierto(false)}
          onConfirmarPago={(cuotaActualizada, nuevaTx) => {
            onRegistrarPagoCuota(cuotaActualizada, nuevaTx);
            setEstudianteSeleccionadoId(cuotaActualizada.estudianteId);
            const est = estudiantes.find(e => e.id === cuotaActualizada.estudianteId);
            const car = carreras.find(c => c.id === cuotaActualizada.carreraId);
            if (est && car) {
              setReciboActivoParaImprimir({
                nroRecibo: nuevaTx.nroRecibo,
                fecha: nuevaTx.fecha,
                hora: nuevaTx.hora || new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
                cajero: nuevaTx.cajero || 'Caja Central',
                metodoPago: nuevaTx.metodoPago,
                estudiante: est,
                carrera: car,
                concepto: `Pensión Mensual • Cuota N° ${cuotaActualizada.numeroCuota || 1} (${cuotaActualizada.mesCorrespondiente || 'Mensualidad'})`,
                totalAbonado: Number(nuevaTx.montoBs || 0),
                cuotasInfo: [{
                  numeroCuota: cuotaActualizada.numeroCuota || 1,
                  mes: cuotaActualizada.mesCorrespondiente || `Cuota ${cuotaActualizada.numeroCuota || 1}`,
                  montoAbonado: Number(nuevaTx.montoBs || 0),
                  saldoRestante: Number(cuotaActualizada.saldoPendienteBs || 0),
                  estadoFinal: String(cuotaActualizada.estado || 'Cancelado')
                }],
                observaciones: nuevaTx.observaciones || ''
              });
            }
          }}
          onConfirmarPagosMultiples={(cuotasActualizadas, nuevasTx, reciboInfo) => {
            if (onRegistrarPagosMultiples) {
              onRegistrarPagosMultiples(cuotasActualizadas, nuevasTx);
            } else {
              cuotasActualizadas.forEach((c, idx) => {
                onRegistrarPagoCuota(c, nuevasTx[idx]);
              });
            }
            if (cuotasActualizadas.length > 0) {
              setEstudianteSeleccionadoId(cuotasActualizadas[0].estudianteId);
            }
            setReciboActivoParaImprimir(reciboInfo);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR ARANCELES DE CARRERA (PESTAÑA COSTOS_CARRERAS)              */}
      {/* ========================================================================= */}
      {carreraEditandoCostos && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Modificar Aranceles Oficiales</h3>
                <p className="text-xs text-blue-900 font-bold">
                  {carreraEditandoCostos.carreraNombre} ({carreraEditandoCostos.carreraCodigo})
                </p>
              </div>
              <button 
                onClick={() => setCarreraEditandoCostos(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarCostos} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Costo de Matrícula Oficial Anual (Bs) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editMatricula}
                  onChange={(e) => setEditMatricula(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Pensión Mensual (Bs) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editPension}
                    onChange={(e) => setEditPension(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Número de Cuotas *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={12}
                    value={editCuotas}
                    onChange={(e) => setEditCuotas(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                  />
                </div>
              </div>
              <span className="text-[10px] text-slate-500 block">
                Total Anual de Pensiones: {(Number(editPension) * Number(editCuotas || 10)).toLocaleString()} Bs ({editCuotas || 10} cuotas de {editPension} Bs)
              </span>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Otros Costos Oficiales (Bs) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editOtros}
                  onChange={(e) => setEditOtros(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Descripción de Otros Costos
                </label>
                <input
                  type="text"
                  value={editDescOtros}
                  onChange={(e) => setEditDescOtros(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="chk-actualizar-alumnos-cuotas"
                  checked={actualizarAlumnosTarifa}
                  onChange={(e) => setActualizarAlumnosTarifa(e.target.checked)}
                  className="mt-0.5 rounded text-blue-900 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="chk-actualizar-alumnos-cuotas" className="text-slate-700 font-medium cursor-pointer leading-tight">
                  Actualizar cuotas mensuales pendientes de los alumnos de esta carrera que pagan tarifa regular (no afecta becas ni rebajas pactadas).
                </label>
              </div>

              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-xs flex justify-between items-center">
                <span className="font-bold text-emerald-950">Nuevo Total Anual:</span>
                <strong className="text-emerald-800 text-sm font-black">
                  {(Number(editMatricula) + (Number(editPension) * Number(editCuotas || 10)) + Number(editOtros)).toLocaleString()} Bs
                </strong>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setCarreraEditandoCostos(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-black rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Aranceles Oficiales</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
