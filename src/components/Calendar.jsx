import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

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

const obtenerPlacasPorDia = (dia) => {
  const diaTurno = dia.getDate();
  const diaModulo = diaTurno % 5;
  return asignaciones[diaModulo] || [];
};

const CalendarComponent = () => {
  const [fecha, setFecha] = useState(new Date());

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Calendario del Mes</h1>
      <Calendar
        onChange={setFecha}
        value={fecha}
      />
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Placas correspondientes:</h2>
        <p>{obtenerPlacasPorDia(fecha).join(', ')}</p>
      </div>
      <div className="grid grid-cols-7 gap-2 mt-4">
        {Array.from({ length: 31 }, (_, index) => {
          const dia = index + 1;
          const esHoy = dia === 24;
          const esCincoOSiete = dia === 5 || dia === 6;
          return (
            <div key={dia} className={`border p-2 text-center ${esHoy ? 'bg-red-500' : ''} ${esCincoOSiete ? 'text-red-500' : ''}`}>  
              <p className={`font-semibold ${esCincoOSiete ? 'text-red-500' : ''}`}>{dia}</p>
              <p>{obtenerPlacasPorDia(new Date(fecha.getFullYear(), fecha.getMonth(), dia)).join(', ')}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarComponent;
