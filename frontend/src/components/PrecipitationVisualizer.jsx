import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";

const PrecipitationVisualizer = ({ intervalo }) => {
  const [data, setData] = useState([]);
  const [modelAccuracy, setModelAccuracy] = useState(null);
  const [today, setToday] = useState(new Date("2025-07-01")); // Fecha actual de corte

  useEffect(() => {
    if (!intervalo || !intervalo.desde || !intervalo.hasta) return;

    fetch("/predicciones_visualizacion.json")
      .then((res) => res.json())
      .then((raw) => {
        const entries = raw.predicciones || [];

        // Filtrar por el intervalo recibido desde el predictor
        const filtrados = entries.filter((item) => {
          return item.fecha >= intervalo.desde && item.fecha <= intervalo.hasta;
        });

        // Mapear a estructura que espera el gráfico
        const processed = filtrados.map((item) => {
          const fechaDate = new Date(item.fecha + "-01");
          return {
            fecha: item.fecha,
            real: fechaDate < today ? item.precipitacion_real_mm : null,
            predicha: item.precipitacion_predicha_mm ?? null
          };
        });

        setData(processed);
        setModelAccuracy(raw.precision_modelo || null);
      })
      .catch((err) => {
        console.error("❌ Error al cargar datos:", err);
        setData([]);
      });
  }, [intervalo, today]);

  return (
    <div className="mt-8 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">
        📈 Precipitación Real vs Predicha
      </h2>

      {data.length === 0 ? (
        <p className="text-gray-500">No hay datos para mostrar.</p>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="real"
              stroke="#3b82f6"
              name="Valor Real"
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="predicha"
              stroke="#f87171"
              name="Predicción"
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )}

    </div>
  );
};

export default PrecipitationVisualizer;
