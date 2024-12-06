import { useState } from 'react';

// Fecha inicial y asignaciones de placas
const fechaInicial = new Date('2024-12-04'); // Fecha donde comienzan a asignarse 7 y 8
const asignaciones = {
  0: ['1', '2'],
  1: ['3', '4'],
  2: ['5', '6'],
  3: ['7', '8'],
  4: ["9", "0"],
  5: ["1", "2"],
  6: ["3", "4"],
  7: ["5", "6"],
  8: ["7", "8"],
  9: ["9", "0"],
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
      if (fecha < fechaActual) {
        continue; // Saltear los dias pasados
      } else {
        proximoTurno.push({ dia: obtenerNombreDelDia(fecha) });
      }
    }
  }

  return proximoTurno;
};

export const Home = () => {
  const [numeroPlaca, setNumeroPlaca] = useState('');
  const [dias, setDias] = useState([]);

  const handleInputChange = (event) => {
    setNumeroPlaca(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const diasProximos = obtenerProximosDias(numeroPlaca);
    setDias(diasProximos);
  };
  console.log(new Date().toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
  console.log(dias.map(
    (d) => {
      console.log(new Date(d.dia).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }
  ));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Control de Subsidio de Gasolina</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-80">
        <label className="block mb-4">
          <span className="text-gray-700">Introduce el último número de la placa:</span>
          <input
            type="number"
            value={numeroPlaca}
            onChange={handleInputChange}
            min="0"
            max="9"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </label>
        <button
          type="submit"
          className="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-400 transition duration-200"
        >
          Consultar Días
        </button>
      </form>

      {dias.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Próximos Días para Surtir Gasolina:</h2>
          <ul className="mt-2 bg-white p-4 rounded-lg shadow-md">
            {dias.map((turno, index) => (

              <li key={index} className="flex justify-between py-2 border-b last:border-b-0">
                <span>{turno.dia === new Date().toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) ? `Hoy ${turno.dia}` : turno.dia}:</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};