import { useState, useEffect } from 'react';
import Logo from "../assets/LogoSinFondo.png";

// Fecha inicial y ciclo de asignaciones (patrones de 5 días)
const fechaInicial = new Date('2025-04-27 00:00:00');
const asignacionesCiclo = [
  ['1', '2'],
  ['3', '4'],
  ['5', '6'],
  ['7', '8'],
  ['9', '0'],
];

// Función para obtener las placas correspondientes a una fecha específica
const obtenerPlacasParaFecha = (fecha) => {
  // Calcular días transcurridos desde la fecha inicial
  const unDia = 24 * 60 * 60 * 1000;
  const diasTranscurridos = Math.floor((fecha.getTime() - fechaInicial.getTime()) / unDia);
  const indiceCiclo = ((diasTranscurridos % 5) + 5) % 5; // Aseguramos un índice positivo
  return asignacionesCiclo[indiceCiclo];
};

// Función para obtener las placas de hoy
const obtenerPlacasHoy = () => {
  return obtenerPlacasParaFecha(new Date());
};

// Función para obtener las placas de mañana
const obtenerPlacasMañana = () => {
  const fechaMañana = new Date();
  fechaMañana.setDate(fechaMañana.getDate() + 1);
  return obtenerPlacasParaFecha(fechaMañana);
};

const obtenerNombreDelDia = (fecha) => {
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return fecha.toLocaleDateString('es-VE', opciones);
};

const obtenerProximosDias = (ultimoNumero) => {
  const proximoTurno = [];

  // Encontrar a qué día del ciclo corresponde este número de placa
  let diaCiclo = -1;
  for (let i = 0; i < asignacionesCiclo.length; i++) {
    if (asignacionesCiclo[i].includes(ultimoNumero)) {
      diaCiclo = i;
      break;
    }
  }

  if (diaCiclo === -1) {
    return proximoTurno; // No se encontró coincidencia
  }

  // Calcular los próximos días para este número de placa
  const hoy = new Date();
  console.log(hoy.toTimeString());
  // Buscar hasta 10 días en el futuro para encontrar los próximos 2 días aplicables
  for (let i = 0; proximoTurno.length < 2 && i < 10; i++) {
    const fechaFutura = new Date(hoy);
    fechaFutura.setDate(hoy.getDate() + i);

    const placasDia = obtenerPlacasParaFecha(fechaFutura);

    if (placasDia.includes(ultimoNumero)) {
      proximoTurno.push({
        dia: obtenerNombreDelDia(fechaFutura),
        fecha: fechaFutura,
        placas: placasDia
      });
    }
  }

  return proximoTurno;
};

export const Home = () => {
  const [numeroPlaca, setNumeroPlaca] = useState('');
  const [dias, setDias] = useState([]);
  const [notificacionesActivas, setNotificacionesActivas] = useState(false);
  const [placasGuardadas, setPlacasGuardadas] = useState([]);

  useEffect(() => {
    // Cargar placas guardadas en localStorage al iniciar
    const placasAlmacenadas = localStorage.getItem('placasGuardadas');
    if (placasAlmacenadas) {
      setPlacasGuardadas(JSON.parse(placasAlmacenadas));
    }

    // Verificar si las notificaciones están soportadas
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      checkNotificacionesEstado();
    }

    // Comprobar si hay placas guardadas y activar notificaciones automáticamente
    activarNotificacionesAutomaticas();
  }, []);

  // Función para activar notificaciones para placas guardadas
  const activarNotificacionesAutomaticas = async () => {
    const placasAlmacenadas = localStorage.getItem('placasGuardadas');
    if (!placasAlmacenadas) return;

    try {
      // Verificar si ya hay permisos de notificación
      if (Notification.permission === 'granted') {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          if (!subscription) {
            // Si no hay suscripción, crearla para todas las placas guardadas
            const nuevaSubscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array('BCF9I-Ej1yBA-nZUSwSCLIRMWM6crmSHH-yGAJTbrqIQjQgAabykEGAZUqF1WkhqHwn7U1Tme1Bz4u18W22Aw-g')
            });

            // Guardar la suscripción para cada placa
            const placas = JSON.parse(placasAlmacenadas);
            for (const placa of placas) {
              await guardarSuscripcion(nuevaSubscription, placa);
            }

            setNotificacionesActivas(true);
          }
        }
      }
    } catch (error) {
      console.error('Error al activar notificaciones automáticas:', error);
    }
  };

  // Función para guardar una placa en localStorage
  const guardarPlacaLocal = (placa) => {
    const placasActuales = [...placasGuardadas];
    if (!placasActuales.includes(placa)) {
      placasActuales.push(placa);
      setPlacasGuardadas(placasActuales);
      localStorage.setItem('placasGuardadas', JSON.stringify(placasActuales));
    }
  };

  // Función para eliminar una placa de localStorage
  const eliminarPlacaLocal = (placa) => {
    const placasActuales = placasGuardadas.filter(p => p !== placa);
    setPlacasGuardadas(placasActuales);
    localStorage.setItem('placasGuardadas', JSON.stringify(placasActuales));
  };

  const checkNotificacionesEstado = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.pushManager) {
        const subscription = await registration.pushManager.getSubscription();
        setNotificacionesActivas(!!subscription);
      }
    } catch (error) {
      console.error('Error al verificar estado de notificaciones:', error);
    }
  };

  const activarNotificaciones = async () => {
    try {
      // Solicitar permiso para notificaciones
      const permiso = await Notification.requestPermission();
      if (permiso !== 'granted') {
        alert('Necesitas permitir notificaciones para recibir alertas');
        return;
      }

      // Registrar service worker si no está registrado
      const registration = await navigator.serviceWorker.register('/service-worker.js');

      // Obtener la suscripción actual o crear una nueva
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('BCF9I-Ej1yBA-nZUSwSCLIRMWM6crmSHH-yGAJTbrqIQjQgAabykEGAZUqF1WkhqHwn7U1Tme1Bz4u18W22Aw-g')
      });

      // Guardar la placa localmente y en el servidor
      guardarPlacaLocal(numeroPlaca);
      await guardarSuscripcion(subscription, numeroPlaca);

      setNotificacionesActivas(true);
      alert('¡Notificaciones activadas! Recibirás alertas cuando corresponda a tu placa.');
    } catch (error) {
      console.error('Error al activar notificaciones:', error);
      alert('Error al activar notificaciones. Por favor, intenta de nuevo.');
    }
  };

  const desactivarNotificaciones = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          // Eliminar placa del almacenamiento local
          eliminarPlacaLocal(numeroPlaca);

          // Eliminar suscripción del servidor
          await eliminarSuscripcion(subscription);

          // Cancelar suscripción si no quedan placas guardadas
          if (placasGuardadas.length === 0) {
            await subscription.unsubscribe();
            setNotificacionesActivas(false);
          }

          alert('Notificaciones desactivadas para esta placa');
        }
      }
    } catch (error) {
      console.error('Error al desactivar notificaciones:', error);
    }
  };

  // Función auxiliar para convertir la clave VAPID
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Función para enviar la suscripción al servidor
  const guardarSuscripcion = async (subscription, placa) => {
    try {
      await fetch('http://localhost:3001/api/suscripciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription, placa })
      });
    } catch (error) {
      console.error('Error al guardar suscripción:', error);
    }
  };

  // Función para eliminar la suscripción del servidor
  const eliminarSuscripcion = async (subscription) => {
    try {
      await fetch('http://localhost:3001/api/suscripciones', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription, placa: numeroPlaca })
      });
    } catch (error) {
      console.error('Error al eliminar suscripción:', error);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const diasProximos = obtenerProximosDias(numeroPlaca);
    setDias(diasProximos);
  };

  // Sección para manejar el cambio de placa directamente
  const actualizarPlacaSeleccionada = (placa) => {
    setNumeroPlaca(placa);
    const diasProximos = obtenerProximosDias(placa);
    setDias(diasProximos);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white font-sans py-6">
      <header className="flex flex-col justify-center items-center mb-6 w-full max-w-lg px-4">
        <div className="flex items-center mb-3">
          <img src={Logo} alt="Logo de OterGas" className="w-20 h-auto mr-3" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
            Control de <span className="text-blue-600">Subsidio</span>
          </h1>
        </div>

        {/* Banner informativo */}
        <div className="w-full bg-blue-600 text-white rounded-lg p-3 mb-4 flex items-center justify-between">
          <div>
            <p className="font-semibold">Hoy circulan placas terminadas en:</p>
            <p className="text-2xl font-bold">{obtenerPlacasHoy().join(' y ')}</p>
          </div>
          <button
            onClick={() => document.getElementById('modal-notificaciones').classList.toggle('hidden')}
            className="bg-white text-blue-600 p-3 rounded-full hover:bg-blue-100 transition-colors"
            aria-label="Configurar notificaciones"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Modal mejorado */}
      <div id="modal-notificaciones" className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 hidden backdrop-blur-sm transition-all duration-300">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl transform transition-all">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold text-gray-800">Centro de Notificaciones</h2>
            <button
              onClick={() => document.getElementById('modal-notificaciones').classList.add('hidden')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-700">Estado:</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${notificacionesActivas ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {notificacionesActivas ? 'Notificaciones activadas' : 'Notificaciones desactivadas'}
                </span>
              </div>
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${notificacionesActivas ? 'bg-green-500' : 'bg-red-500'} transition-all duration-500`} style={{ width: notificacionesActivas ? '100%' : '0%' }}></div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="font-semibold text-gray-700 mb-3">Calendario de placas:</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500">Hoy</p>
                  <p className="text-lg font-bold text-blue-600">{obtenerPlacasHoy().join(' y ')}</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500">Mañana</p>
                  <p className="text-lg font-bold text-indigo-600">{obtenerPlacasMañana().join(' y ')}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="font-semibold text-gray-700 mb-3">Mis placas guardadas:</p>
              {placasGuardadas.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {placasGuardadas.map(placa => (
                    <div key={placa} className="bg-blue-50 rounded-lg p-2 relative group">
                      <p className="text-center text-xl font-bold text-blue-700">{placa}</p>
                      <button
                        onClick={() => {
                          setNumeroPlaca(placa);
                          desactivarNotificaciones();
                          document.getElementById('modal-notificaciones').classList.add('hidden');
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Eliminar placa"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-5 text-center">
                  <p className="text-gray-500">No tienes placas guardadas</p>
                  <p className="text-sm text-gray-400 mt-1">Selecciona un número abajo y activa las notificaciones</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {placasGuardadas.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('¿Estás seguro de eliminar todas las notificaciones?')) {
                      placasGuardadas.forEach(placa => {
                        setNumeroPlaca(placa);
                        desactivarNotificaciones();
                      });
                    }
                  }}
                  className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white transition-colors text-sm font-medium"
                >
                  Eliminar todas
                </button>
              )}
              <button
                onClick={() => document.getElementById('modal-notificaciones').classList.add('hidden')}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="w-full max-w-lg">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mx-4">
          {/* Selector de placa */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Selecciona el último número de tu placa</h2>
            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((numero, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setNumeroPlaca(numero.toString());
                    const diasProximos = obtenerProximosDias(numero.toString());
                    setDias(diasProximos);
                  }}
                  className={`
                    aspect-square flex justify-center items-center text-2xl font-bold rounded-lg transition-all transform hover:scale-105
                    ${numeroPlaca === numero.toString()
                      ? 'bg-blue-600 text-white shadow-md'
                      : obtenerPlacasHoy().includes(numero.toString())
                        ? 'bg-green-100 text-green-800 border-2 border-green-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {numero}
                </button>
              ))}
            </div>
          </div>

          {/* Sección de Notificaciones y Próximos días */}
          <div className="p-6">
            {numeroPlaca ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-gray-800">
                    Placa terminada en: <span className="text-blue-600 text-xl">{numeroPlaca}</span>
                  </p>
                  {placasGuardadas.includes(numeroPlaca) ? (
                    <button
                      onClick={desactivarNotificaciones}
                      className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Desactivar notificaciones
                    </button>
                  ) : (
                    <button
                      onClick={activarNotificaciones}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                      </svg>
                      Activar notificaciones
                    </button>
                  )}
                </div>

                {dias.length > 0 ? (
                  <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                    <div className="bg-blue-600 text-white py-3 px-4">
                      <h3 className="font-bold">Próximos días para surtir gasolina</h3>
                    </div>
                    <ul className="divide-y divide-gray-200">
                      {dias.map((turno, index) => {
                        const esHoy = turno.dia === new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
                        const esMañana = turno.dia === new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

                        return (
                          <li key={index} className={`p-4 flex items-center ${esHoy ? 'bg-green-50' : ''}`}>
                            <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full mr-4 ${esHoy ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                              {index + 1}
                            </div>
                            <div className="flex-grow">
                              <p className="font-semibold">
                                {esHoy ? '¡HOY!' : esMañana ? '¡MAÑANA!' : null}
                              </p>
                              <p className={esHoy ? 'text-green-800 font-semibold' : ''}>{turno.dia}</p>
                            </div>
                            {turno.placas && (
                              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                Placas: {turno.placas.join(', ')}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg border border-yellow-100">
                    Selecciona un número de placa para ver los próximos días disponibles.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">Selecciona el último número de tu placa para consultar</p>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-8 text-center text-gray-500 px-4">
          <p>Desarrollado por <a href="https://www.linkedin.com/in/r%C3%BAbel-maneiro-775931204/" className="text-blue-600 hover:underline">Rúbel Maneiro</a></p>
          <p>© {new Date().getFullYear()} OterGas. Todos los derechos reservados.</p>
        </footer>
      </main>
    </div>
  );
};
