import { useState } from 'react';
import Logo from "../assets/LogoSinFondo.png";

// Fecha inicial y asignaciones de placas
const fechaInicial = new Date(new Date('2024-12-04').setHours(new Date('2024-12-04').getHours() + 3, new Date('2024-12-04').getMinutes() + 59));
; // Fecha donde comienzan a asignarse 7 y 8
const asignaciones = {
  0: ['1', '2'],
  1: ['3', '4'],
  2: ['5', '6'],
  3: ['7', '8'],
  4: ['9', '0'],
  5: ['1', '2'],
  6: ['3', '4'],
  7: ['5', '6'],
  8: ['7', '8'],
  9: ['9', '0'],
};

const obtenerNombreDelDia = (fecha) => {
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return fecha.toLocaleDateString('es-VE', opciones);
};

const obtenerProximosDias = (ultimoNumero) => {
  const proximoTurno = [];
  let diaActual = -1;

  // Determinar el día actual de acuerdo al último número de placa
  for (let key in asignaciones) {
    if (asignaciones[key].includes(ultimoNumero)) {
      diaActual = parseInt(key);
      break;
    }
  }

  if (diaActual === -1) {
    return proximoTurno; // Retorna vacío si no hay coincidencias
  }

  // Iterar para encontrar los próximos dos días
  for (let i = 0; proximoTurno.length < 2; i++) {
    const diaTurno = (diaActual + i) % 5; // Ciclo de 5 días
    const fecha = new Date(fechaInicial);
    const fechaActual = new Date();
    fecha.setDate(fechaInicial.getDate() + ((diaActual + i) * 1)); // Sumar días

    if (asignaciones[diaTurno].includes(ultimoNumero)) {
      console.log("Fecha inicial: " + fechaActual);
      console.log("Fecha turno: " + fecha);
      if (fecha < fechaActual) {
        continue; // Saltear los dias pasados
      } else {
        proximoTurno.push({ dia: obtenerNombreDelDia(fecha), fecha: fecha });
      }
    }
  }

  return proximoTurno;
};
console.log(new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));



export const Home = () => {
  const [numeroPlaca, setNumeroPlaca] = useState('');
  const [dias, setDias] = useState([]);
  const placasHoy = asignaciones[new Date().getDay() % 5];

  const handleSubmit = (event) => {
    event.preventDefault();
    const diasProximos = obtenerProximosDias(numeroPlaca);
    setDias(diasProximos);
  };
  return (
    <div className="flex flex-col items-center justify-center calc(min-h-screen - 2rem) bg-gray-100 font-sans">
      <header className="flex flex-col justify-center items-center mb-4">
        <img src={Logo} alt="Logo de OterGas" className="w-32 h-auto mb-2" />
        <h1 className="text-4xl max-md:text-xl font-bold text-center ">Control de Subsidio de Gasolina</h1>
      </header>

      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          <label className="block mb-4 text-gray-700">Selecciona el último número de la placa:</label>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[...Array(10)].map((_, index) => {
              const esHoy = asignaciones[new Date().getDay() % 5].includes(index.toString());
              return (
                <button
                  key={index}
                  onClick={() => setNumeroPlaca(index.toString())}
                  className={`flex justify-center items-center h-12 text-lg font-bold rounded-md transition-colors ${numeroPlaca === index.toString() ||
                    numeroPlaca === asignaciones[fechaInicial.getDay() % 5][0] &&
                    numeroPlaca === asignaciones[fechaInicial.getDay() % 5][1]
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-200 hover:bg-blue-300'
                    } ${esHoy ? 'bg-blue-400' : ''}`}
                >
                  {index}
                </button>
              );
            })}
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-lg font-semibold">Placas que corresponden hoy:</p>
          <p className="text-blue-500">{placasHoy.join(' y ')}</p>
        </div>

        {dias.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Próximos Días para Surtir Gasolina:</h2>
            <ul className="mt-2 bg-gray-50 p-4 rounded-lg shadow-md">
              {dias.map((turno, index) => (
                <li key={index} className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                  <span>{index + 1}</span>
                  <span>{turno.dia === new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) ? `Hoy ${turno.dia}` : turno.dia === new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) ? `Mañana ${turno.dia}` : turno.dia}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <footer className="mt-8 text-center text-gray-500">
          <p>Desarrollado por <a href="https://www.linkedin.com/in/r%C3%BAbel-maneiro-775931204/" className="text-blue-500 hover:underline">Rúbel Maneiro</a></p>
          <p>© {new Date().getFullYear()} OterGas. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  );
};
