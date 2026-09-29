import React, { useState, useMemo, useEffect } from 'react';
import { 
  Estudiante, 
  Carrera, 
  PagoCuotaEstudiante, 
  TransaccionPago, 
  MetodoPago, 
  EstadoPagoCuota,
  CostoCarrera
} from '../types';
import { 
  DollarSign, 
  CreditCard, 
  Receipt, 
  Check, 
  X, 
  Search, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Percent,
  CheckSquare,
  Layers,
  ArrowRight
} from 'lucide-react';
import { MESES_10_CUOTAS, COSTOS_CARRERAS_INICIALES } from '../data/initialData';

export interface DetalleCuotaPago {
  numeroCuota: number;
  mes: string;
  montoAbonado: number;
  saldoRestante: number;
  montoPactado?: number;
  estadoFinal: string;
}

export interface ReciboMultipleInfo {
  estudiante: Estudiante;
  carrera: Carrera;
  cuotasInfo: DetalleCuotaPago[];
  totalAbonado: number;
  nroRecibo: string;
  concepto: string;
  metodoPago: MetodoPago;
  fecha: string;
  hora: string;
  cajero: string;
  observaciones?: string;
}

interface ModalRegistrarPagoPorCuotaProps {
  estudiantes: Estudiante[];
  carreras: Carrera[];
  costosCarreras?: CostoCarrera[];
  pagosCuotas: PagoCuotaEstudiante[];
  estudianteInicialId?: string;
  cuotaInicialNumero?: number;
  onClose: () => void;
  onConfirmarPago: (cuotaActualizada: PagoCuotaEstudiante, nuevaTx: TransaccionPago) => void;
  onConfirmarPagosMultiples?: (
    cuotasActualizadas: PagoCuotaEstudiante[],
    nuevasTx: TransaccionPago[],
    reciboInfo: ReciboMultipleInfo
  ) => void;
}

export const ModalRegistrarPagoPorCuota: React.FC<ModalRegistrarPagoPorCuotaProps> = ({
  estudiantes,
  carreras,
  costosCarreras = COSTOS_CARRERAS_INICIALES,
  pagosCuotas,
  estudianteInicialId,
  cuotaInicialNumero = 1,
  onClose,
  onConfirmarPago,
  onConfirmarPagosMultiples
}) => {
  const [estudianteId, setEstudianteId] = useState<string>(
    estudianteInicialId || estudiantes[0]?.id || ''
  );

  // Lista de números de cuotas seleccionadas simultáneamente (1 al 10)
  const [cuotasSeleccionadas, setCuotasSeleccionadas] = useState<number[]>([
    cuotaInicialNumero || 1
  ]);

  const [busquedaEstudiante, setBusquedaEstudiante] = useState('');

  // Estudiante seleccionado
  const estudianteSeleccionado = useMemo(() => {
    return estudiantes.find(e => e.id === estudianteId) || estudiantes[0] || null;
  }, [estudiantes, estudianteId]);

  // Carrera del estudiante
  const carreraSeleccionada = useMemo(() => {
    if (!estudianteSeleccionado) return null;
    return carreras.find(c => c.id === estudianteSeleccionado.carreraId) || carreras[0] || null;
  }, [carreras, estudianteSeleccionado]);

  // Costo base de la mensualidad para este estudiante
  const costoC = useMemo(() => {
    if (!estudianteSeleccionado) return costosCarreras[0];
    return costosCarreras.find(c => c.carreraId === estudianteSeleccionado.carreraId) || costosCarreras[0];
  }, [costosCarreras, estudianteSeleccionado]);

  const pensionPactada = estudianteSeleccionado?.montoMensualidadFinalBs ?? costoC?.costoMensualidadBs ?? 380;

  // Cuotas del estudiante seleccionado (10 cuotas mensuales garantizadas)
  const cuotasEstudiante = useMemo(() => {
    if (!estudianteSeleccionado) return [];
    
    return MESES_10_CUOTAS.map(item => {
      const encontrada = pagosCuotas.find(
        p => p.estudianteId === estudianteSeleccionado.id && 
             p.numeroCuota === item.numero && 
             p.tipoPago === 'Cuota Mensual'
      );
      if (encontrada) return encontrada;
      return {
        id: `pago-${estudianteSeleccionado.id}-cuota-${item.numero}`,
        estudianteId: estudianteSeleccionado.id,
        codigoEstudiante: estudianteSeleccionado.codigo,
        nombreEstudiante: `${estudianteSeleccionado.apellidos}, ${estudianteSeleccionado.nombres}`,
        carreraId: estudianteSeleccionado.carreraId,
        anio: estudianteSeleccionado.anioActual || 1,
        gestion: '2026',
        tipoPago: 'Cuota Mensual' as const,
        numeroCuota: item.numero,
        mesCorrespondiente: item.mes,
        fechaVencimiento: item.fechaVencimiento,
        montoPactadoBs: pensionPactada,
        montoPagadoBs: 0,
        saldoPendienteBs: pensionPactada,
        estado: 'Pendiente' as EstadoPagoCuota,
        transacciones: []
      };
    });
  }, [estudianteSeleccionado, pagosCuotas, pensionPactada]);

  // Objetos de las cuotas seleccionadas en orden ascendente
  const cuotasObjSeleccionadas = useMemo(() => {
    return cuotasEstudiante
      .filter(c => cuotasSeleccionadas.includes(c.numeroCuota || 0))
      .sort((a, b) => (a.numeroCuota || 0) - (b.numeroCuota || 0));
  }, [cuotasEstudiante, cuotasSeleccionadas]);

  // Totales consolidados de las cuotas seleccionadas
  const totalPactadoSeleccionado = useMemo(() => {
    return cuotasObjSeleccionadas.reduce((acc, c) => acc + c.montoPactadoBs, 0);
  }, [cuotasObjSeleccionadas]);

  const totalPagadoPrevio = useMemo(() => {
    return cuotasObjSeleccionadas.reduce((acc, c) => acc + c.montoPagadoBs, 0);
  }, [cuotasObjSeleccionadas]);

  const totalSaldoSeleccionado = useMemo(() => {
    return cuotasObjSeleccionadas.reduce((acc, c) => acc + c.saldoPendienteBs, 0);
  }, [cuotasObjSeleccionadas]);

  // Datos del formulario de pago
  const [montoAbono, setMontoAbono] = useState<number>(0);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Efectivo');
  const [nroRecibo, setNroRecibo] = useState<string>(() => {
    const corr = Math.floor(1000 + Math.random() * 9000);
    return `REC-2026-${corr}`;
  });
  const [fechaPago, setFechaPago] = useState<string>(new Date().toISOString().slice(0, 10));
  const [cajero, setCajero] = useState<string>('Caja Central');
  const [observaciones, setObservaciones] = useState<string>('');

  // Sincronizar monto sugerido y observaciones cada vez que cambian las cuotas seleccionadas
  useEffect(() => {
    const saldo = totalSaldoSeleccionado > 0 ? totalSaldoSeleccionado : totalPactadoSeleccionado;
    setMontoAbono(saldo);

    if (cuotasObjSeleccionadas.length === 1) {
      const c = cuotasObjSeleccionadas[0];
      setObservaciones(`Pago de Cuota N° ${c.numeroCuota} (${c.mesCorrespondiente})`);
    } else if (cuotasObjSeleccionadas.length > 1) {
      const nums = cuotasObjSeleccionadas.map(c => `N° ${c.numeroCuota} (${c.mesCorrespondiente})`).join(', ');
      setObservaciones(`Pago simultáneo de Cuotas: ${nums}`);
    } else {
      setObservaciones('');
    }
  }, [cuotasSeleccionadas, totalSaldoSeleccionado, totalPactadoSeleccionado]);

  // Conmutar selección de cuota (Toggle checkbox / tarjeta)
  const handleToggleCuota = (num: number) => {
    setCuotasSeleccionadas(prev => {
      if (prev.includes(num)) {
        if (prev.length === 1) {
          // Mantener al menos 1 cuota seleccionada
          return prev;
        }
        return prev.filter(n => n !== num).sort((a, b) => a - b);
      } else {
        return [...prev, num].sort((a, b) => a - b);
      }
    });
  };

  // Accesos rápidos de selección múltiple
  const handleSeleccionarTodasPendientes = () => {
    const pendientes = cuotasEstudiante
      .filter(c => c.saldoPendienteBs > 0)
      .map(c => c.numeroCuota || 1);

    if (pendientes.length > 0) {
      setCuotasSeleccionadas(pendientes.sort((a, b) => a - b));
    }
  };

  const handleSeleccionarNCuotas = (cantidad: number) => {
    // Buscar cuotas con saldo o primeras 'cantidad'
    const pendientes = cuotasEstudiante.filter(c => c.saldoPendienteBs > 0);
    const lista = (pendientes.length >= cantidad ? pendientes : cuotasEstudiante)
      .slice(0, cantidad)
      .map(c => c.numeroCuota || 1);

    if (lista.length > 0) {
      setCuotasSeleccionadas(lista.sort((a, b) => a - b));
    }
  };

  const handleSeleccionarSemestre = () => {
    const lista = [1, 2, 3, 4, 5];
    setCuotasSeleccionadas(lista);
  };

  const handleSeleccionarAnual = () => {
    const lista = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    setCuotasSeleccionadas(lista);
  };

  const handleSeleccionarSoloUna = (num: number) => {
    setCuotasSeleccionadas([num]);
  };

  // Al cambiar el estudiante seleccionado
  const handleSeleccionarEstudiante = (id: string) => {
    setEstudianteId(id);
    const cuotasEst = pagosCuotas.filter(p => p.estudianteId === id && p.tipoPago === 'Cuota Mensual');
    const primeraPendiente = MESES_10_CUOTAS.find(m => {
      const encontrada = cuotasEst.find(p => p.numeroCuota === m.numero);
      return !encontrada || encontrada.saldoPendienteBs > 0;
    });

    const targetCuota = primeraPendiente?.numero || 1;
    setCuotasSeleccionadas([targetCuota]);
  };

  // Simulación en tiempo real de cómo se distribuirá el monto ingresado entre las cuotas seleccionadas
  const distribucionEnVivo = useMemo(() => {
    let restante = Number(montoAbono) || 0;
    return cuotasObjSeleccionadas.map((cuota, idx) => {
      const esUltima = idx === cuotasObjSeleccionadas.length - 1;
      let abono = 0;
      if (esUltima) {
        abono = restante;
      } else {
        abono = Math.min(restante, cuota.saldoPendienteBs);
      }
      restante = Math.max(0, restante - abono);
      const nuevoSaldo = Math.max(0, cuota.saldoPendienteBs - abono);
      return {
        cuota,
        abono,
        nuevoSaldo,
        liquidada: nuevoSaldo === 0 && abono > 0
      };
    });
  }, [cuotasObjSeleccionadas, montoAbono]);

  // Manejo de confirmación y cobro
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estudianteSeleccionado || cuotasObjSeleccionadas.length === 0) return;

    const montoTotal = Number(montoAbono);
    if (montoTotal <= 0) {
      alert('El monto del cobro debe ser mayor a 0 Bs.');
      return;
    }

    if (totalSaldoSeleccionado > 0 && montoTotal > totalSaldoSeleccionado) {
      const confirmExcedente = window.confirm(
        `El monto ingresado (${montoTotal} Bs) supera el saldo total de las cuotas seleccionadas (${totalSaldoSeleccionado} Bs). ¿Deseas registrarlo de todos modos?`
      );
      if (!confirmExcedente) return;
    }

    let montoRestante = montoTotal;
    const cuotasActualizadas: PagoCuotaEstudiante[] = [];
    const nuevasTransacciones: TransaccionPago[] = [];
    const detalleCuotasRecibo: DetalleCuotaPago[] = [];
    const horaHoy = new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });

    cuotasObjSeleccionadas.forEach((cuota, idx) => {
      const esUltima = idx === cuotasObjSeleccionadas.length - 1;
      let abonoCuota = 0;

      if (esUltima) {
        abonoCuota = montoRestante;
      } else {
        abonoCuota = Math.min(montoRestante, cuota.saldoPendienteBs);
      }
      montoRestante = Math.max(0, montoRestante - abonoCuota);

      const nuevoTotalPagado = cuota.montoPagadoBs + abonoCuota;
      const nuevoSaldo = Math.max(0, cuota.montoPactadoBs - nuevoTotalPagado);
      const nuevoEstado: EstadoPagoCuota = nuevoSaldo === 0 ? 'Cancelado' : nuevoTotalPagado > 0 ? 'Parcial' : 'Pendiente';

      const tx: TransaccionPago = {
        id: `tx-cuota-${Date.now()}-${cuota.numeroCuota}`,
        fecha: fechaPago,
        hora: horaHoy,
        montoBs: abonoCuota,
        metodoPago,
        nroRecibo: nroRecibo || `REC-2026-${Date.now().toString().slice(-4)}`,
        cajero: cajero || 'Caja Central',
        observaciones: `Abono Cuota N° ${cuota.numeroCuota} (${cuota.mesCorrespondiente}) • ${observaciones}`
      };

      const actualizada: PagoCuotaEstudiante = {
        ...cuota,
        montoPagadoBs: nuevoTotalPagado,
        saldoPendienteBs: nuevoSaldo,
        estado: nuevoEstado,
        ultimoNroRecibo: tx.nroRecibo,
        ultimaFechaPago: fechaPago,
        ultimoMetodoPago: metodoPago,
        transacciones: [...(cuota.transacciones || []), tx]
      };

      cuotasActualizadas.push(actualizada);
      nuevasTransacciones.push(tx);
      detalleCuotasRecibo.push({
        numeroCuota: cuota.numeroCuota || 0,
        mes: cuota.mesCorrespondiente || `Cuota ${cuota.numeroCuota}`,
        montoAbonado: abonoCuota,
        saldoRestante: nuevoSaldo,
        montoPactado: cuota.montoPactadoBs,
        estadoFinal: nuevoEstado
      });
    });

    const reciboInfo: ReciboMultipleInfo = {
      estudiante: estudianteSeleccionado,
      carrera: carreraSeleccionada || carreras[0],
      cuotasInfo: detalleCuotasRecibo,
      totalAbonado: montoTotal,
      nroRecibo: nroRecibo || `REC-2026-${Date.now().toString().slice(-4)}`,
      concepto: cuotasObjSeleccionadas.length > 1
        ? `Pensión Mensual • Pago Simultáneo de ${cuotasObjSeleccionadas.length} Cuotas: ${cuotasObjSeleccionadas.map(c => `N° ${c.numeroCuota} (${c.mesCorrespondiente})`).join(', ')}`
        : `Pensión Mensual • Cuota N° ${cuotasObjSeleccionadas[0]?.numeroCuota} (${cuotasObjSeleccionadas[0]?.mesCorrespondiente})`,
      metodoPago,
      fecha: fechaPago,
      hora: horaHoy,
      cajero: cajero || 'Caja Central',
      observaciones
    };

    if (onConfirmarPagosMultiples) {
      onConfirmarPagosMultiples(cuotasActualizadas, nuevasTransacciones, reciboInfo);
    } else {
      // Fallback a un solo pago
      onConfirmarPago(cuotasActualizadas[0], nuevasTransacciones[0]);
    }

    onClose();
  };

  const estudiantesFiltrados = useMemo(() => {
    if (!busquedaEstudiante.trim()) return estudiantes;
    const txt = busquedaEstudiante.toLowerCase();
    return estudiantes.filter(e => 
      `${e.nombres} ${e.apellidos} ${e.ci} ${e.codigo}`.toLowerCase().includes(txt)
    );
  }, [estudiantes, busquedaEstudiante]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95">
        
        {/* Cabecera del Modal */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-5 flex justify-between items-center border-b border-blue-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-2xl shadow-md">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                Registrar Pago de Mensualidad por N° de Cuota
              </h3>
              <p className="text-xs text-blue-200">
                Selecciona al estudiante y una o varias Cuotas Simultáneas (1 al 10) para emitir el cobro en caja.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
          
          {/* 1. SELECCIÓN DE ESTUDIANTE */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-900" />
                <span>1. Seleccionar Estudiante Titular *</span>
              </label>
              <span className="text-[10px] text-slate-500 font-bold">
                {estudiantes.length} Matriculados
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={busquedaEstudiante}
                onChange={(e) => setBusquedaEstudiante(e.target.value)}
                placeholder="Filtrar por nombre, CI o código de estudiante..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
            </div>

            <select
              value={estudianteId}
              onChange={(e) => handleSeleccionarEstudiante(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            >
              {estudiantesFiltrados.map(e => {
                const c = carreras.find(car => car.id === e.carreraId)?.nombre || '';
                return (
                  <option key={e.id} value={e.id}>
                    {e.apellidos.toUpperCase()}, {e.nombres} ({e.codigo} • CI: {e.ci} {e.expedido}) - {c}
                  </option>
                );
              })}
            </select>

            {/* Ficha Resumida del Estudiante */}
            {estudianteSeleccionado && carreraSeleccionada && (
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 flex flex-wrap justify-between items-center gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Carrera & Nivel:</span>
                  <strong className="text-blue-950 font-bold">
                    {carreraSeleccionada.nombre} ({estudianteSeleccionado.anioActual || 1}° Año • {estudianteSeleccionado.turno})
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Pensión Mensual Pactada:</span>
                  <strong className="text-emerald-800 text-xs font-black">
                    {pensionPactada} Bs / mes
                  </strong>
                  {estudianteSeleccionado.tipoDescuento && estudianteSeleccionado.tipoDescuento !== 'Ninguno' && (
                    <span className="text-[9px] bg-indigo-100 text-indigo-900 font-bold px-1.5 py-0.2 rounded ml-1">
                      {estudianteSeleccionado.tipoDescuento}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. SELECTOR VISUAL DE LAS 10 CUOTAS (CON SELECCIÓN MÚLTIPLE SIMULTÁNEA) */}
          <div className="space-y-2.5 bg-slate-50/80 p-4 rounded-3xl border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <label className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span>2. Seleccionar Cuotas a Cancelar (Una o Varias Simultáneas) *</span>
                </label>
                <p className="text-[10px] text-slate-500">
                  Haz clic en las casillas (o en la tarjeta) para marcar varias cuotas y pagarlas en un solo cobro.
                </p>
              </div>

              {/* Botones de acción rápida para marcar cuotas */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleSeleccionarTodasPendientes}
                  className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 font-black text-[10px] rounded-lg transition cursor-pointer"
                >
                  ✓ Todas Pendientes
                </button>
                <button
                  type="button"
                  onClick={() => handleSeleccionarNCuotas(2)}
                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[10px] rounded-lg transition cursor-pointer"
                >
                  2 Cuotas
                </button>
                <button
                  type="button"
                  onClick={() => handleSeleccionarNCuotas(3)}
                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[10px] rounded-lg transition cursor-pointer"
                >
                  3 Cuotas
                </button>
                <button
                  type="button"
                  onClick={handleSeleccionarSemestre}
                  className="px-2 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-bold text-[10px] rounded-lg transition cursor-pointer"
                >
                  5 Cuotas (Semestre)
                </button>
                <button
                  type="button"
                  onClick={handleSeleccionarAnual}
                  className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-black text-[10px] rounded-lg transition cursor-pointer"
                >
                  10 Cuotas (Año Completo)
                </button>
              </div>
            </div>

            {/* Fila de etiquetas de cuotas seleccionadas con botón para remover */}
            <div className="flex items-center gap-1.5 flex-wrap bg-white p-2.5 rounded-xl border border-slate-200 text-[11px]">
              <span className="text-slate-500 font-bold text-[10px] uppercase mr-1">
                Cuotas Marcadas ({cuotasSeleccionadas.length}):
              </span>
              {cuotasObjSeleccionadas.map(c => (
                <span
                  key={c.numeroCuota}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleCuota(c.numeroCuota || 1);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-900 text-white rounded-md font-bold text-[10px] hover:bg-red-700 transition cursor-pointer shadow-2xs"
                  title="Haz clic para desmarcar esta cuota"
                >
                  <span>C{c.numeroCuota} ({c.mesCorrespondiente})</span>
                  <X className="w-3 h-3 text-amber-300 hover:text-white" />
                </span>
              ))}
            </div>

            {/* Grid interactivo de las 10 cuotas con casillas de verificación */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {cuotasEstudiante.map(c => {
                const estaSeleccionada = cuotasSeleccionadas.includes(c.numeroCuota || 0);
                const estaCancelada = c.estado === 'Cancelado';
                const esParcial = c.estado === 'Parcial';

                return (
                  <div
                    key={c.numeroCuota}
                    onClick={() => handleToggleCuota(c.numeroCuota || 1)}
                    className={`p-2.5 rounded-2xl border text-left transition cursor-pointer relative select-none ${
                      estaSeleccionada 
                        ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-500/50 scale-[1.02]' 
                        : estaCancelada 
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 hover:bg-emerald-100'
                        : esParcial 
                        ? 'bg-amber-50/80 border-amber-300 text-amber-950 hover:bg-amber-100'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {/* Fila Superior: Casilla de Verificación (Exactamente como en la captura) y Número de Cuota */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={estaSeleccionada}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleCuota(c.numeroCuota || 1);
                          }}
                          className={`w-4 h-4 rounded cursor-pointer ${
                            estaSeleccionada 
                              ? 'accent-amber-400 text-amber-500 ring-2 ring-white/50' 
                              : 'accent-blue-900 text-blue-900 border-slate-300'
                          }`}
                        />
                        <span className={`text-[11px] font-black uppercase ${estaSeleccionada ? 'text-amber-300' : 'text-slate-700'}`}>
                          Cuota {c.numeroCuota}
                        </span>
                      </div>

                      {estaCancelada && (
                        <CheckCircle2 className={`w-3.5 h-3.5 ${estaSeleccionada ? 'text-emerald-300' : 'text-emerald-600'}`} />
                      )}
                      {esParcial && (
                        <Clock className={`w-3.5 h-3.5 ${estaSeleccionada ? 'text-amber-300' : 'text-amber-600'}`} />
                      )}
                    </div>

                    <strong className={`block text-xs font-black truncate ${estaSeleccionada ? 'text-white' : 'text-slate-900'}`}>
                      {c.mesCorrespondiente}
                    </strong>

                    <div className="mt-1 text-[10px] font-mono flex justify-between items-center">
                      <span className={estaSeleccionada ? 'text-blue-200' : 'text-slate-500'}>Saldo:</span>
                      <strong className={
                        estaSeleccionada 
                          ? 'text-amber-300 font-black' 
                          : c.saldoPendienteBs === 0 
                          ? 'text-emerald-700 font-bold' 
                          : 'text-amber-700 font-bold'
                      }>
                        {c.saldoPendienteBs} Bs
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estado Consolidado de las cuotas seleccionadas */}
          {cuotasObjSeleccionadas.length > 0 && (
            <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-md">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                    {cuotasObjSeleccionadas.length} {cuotasObjSeleccionadas.length === 1 ? 'Cuota Seleccionada' : 'Cuotas Seleccionadas'}
                  </span>
                  <span className="text-[11px] text-blue-200 font-mono">
                    {cuotasObjSeleccionadas.map(c => `C${c.numeroCuota}`).join(', ')}
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-bold mt-1">
                  {cuotasObjSeleccionadas.map(c => `Cuota ${c.numeroCuota} (${c.mesCorrespondiente})`).join(' • ')}
                </p>
              </div>

              <div className="flex items-center gap-4 text-right w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-blue-900/60 pt-2 sm:pt-0">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Pactado / Pagado:</span>
                  <strong className="text-xs font-mono text-slate-200">
                    {totalPactadoSeleccionado} Bs / {totalPagadoPrevio} Bs
                  </strong>
                </div>

                <div className="pl-4 border-l border-blue-800">
                  <span className="text-[10px] text-amber-300 uppercase block font-black">Saldo Total:</span>
                  <strong className="text-lg text-amber-300 font-black font-mono">
                    {totalSaldoSeleccionado} Bs
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* 3. PARÁMETROS DEL COBRO Y RECIBO */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3.5">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-blue-900" />
                <span>3. Liquidación en Caja y Recibo Oficial</span>
              </h4>
              {cuotasObjSeleccionadas.length > 1 && (
                <span className="text-[10px] bg-indigo-100 text-indigo-900 font-black px-2 py-0.5 rounded-full">
                  Cobro Simultáneo ({cuotasObjSeleccionadas.length} Cuotas)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Monto Total a Cobrar / Abonar (Bs) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={montoAbono}
                  onChange={(e) => setMontoAbono(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-emerald-50 border-2 border-emerald-500 rounded-xl text-base font-black text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                
                {/* Accesos rápidos de monto sugerido */}
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  {totalSaldoSeleccionado > 0 && (
                    <button
                      type="button"
                      onClick={() => setMontoAbono(totalSaldoSeleccionado)}
                      className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-[10px] font-black transition cursor-pointer"
                    >
                      Pagar Total ({totalSaldoSeleccionado} Bs)
                    </button>
                  )}
                  {totalSaldoSeleccionado > 100 && (
                    <button
                      type="button"
                      onClick={() => setMontoAbono(Math.round(totalSaldoSeleccionado / 2))}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
                    >
                      Pagar 50% ({Math.round(totalSaldoSeleccionado / 2)} Bs)
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Método de Pago Oficial *
                </label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                >
                  <option value="Efectivo">Efectivo (Caja Física)</option>
                  <option value="QR Simple">QR Simple (Banca Móvil BNB/BCP/Mercantil)</option>
                  <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                  <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                  <option value="Tigo Money">Tigo Money</option>
                </select>
              </div>
            </div>

            {/* Vista Previa de Distribución en caso de múltiples cuotas */}
            {cuotasObjSeleccionadas.length > 1 && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Distribución del Monto entre las {cuotasObjSeleccionadas.length} Cuotas Seleccionadas:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {distribucionEnVivo.map(({ cuota, abono, nuevoSaldo, liquidada }) => (
                    <div key={cuota.numeroCuota} className="bg-white p-2 rounded-lg border border-slate-200 flex justify-between items-center">
                      <div>
                        <strong className="text-slate-900 block font-bold">
                          Cuota {cuota.numeroCuota} ({cuota.mesCorrespondiente})
                        </strong>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Saldo antes: {cuota.saldoPendienteBs} Bs
                        </span>
                      </div>
                      <div className="text-right">
                        <strong className="text-emerald-700 font-black block font-mono">
                          +{abono} Bs
                        </strong>
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                          liquidada ? 'bg-emerald-100 text-emerald-800' : nuevoSaldo === 0 ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {liquidada ? 'Queda Cancelada' : nuevoSaldo === 0 ? 'Sin Deuda' : `Resta ${nuevoSaldo} Bs`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  N° de Recibo Oficial *
                </label>
                <input
                  type="text"
                  required
                  value={nroRecibo}
                  onChange={(e) => setNroRecibo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Fecha de Pago *
                </label>
                <input
                  type="date"
                  required
                  value={fechaPago}
                  onChange={(e) => setFechaPago(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Cajero / Responsable *
                </label>
                <input
                  type="text"
                  required
                  value={cajero}
                  onChange={(e) => setCajero(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Observaciones / Glosa del Recibo
              </label>
              <input
                type="text"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="ej: Pago simultáneo de Cuotas N° 1 y 2..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>
                {cuotasObjSeleccionadas.length === 1 
                  ? `Confirmar Pago de Cuota N° ${cuotasObjSeleccionadas[0]?.numeroCuota || 1}` 
                  : `Confirmar Pago de ${cuotasObjSeleccionadas.length} Cuotas Simultáneas`}
              </span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
