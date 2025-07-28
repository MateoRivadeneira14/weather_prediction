import React, { useState, useEffect } from "react";
import axios from "axios";
import PrecipitationPredictor from "./PrecipitationPredictor";
import PrecipitationVisualizer from "./PrecipitationVisualizer";
import WindChart from "./WindChart";
import MapStations from "./MapStations";
import { BiBarChart } from "react-icons/bi";
import { BarChart3 } from "lucide-react";
import { WiThermometer, WiHumidity, WiRaindrop, WiStrongWind } from "react-icons/wi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Brush
} from "recharts";

const RainPredictionComponent = () => {
  const [station, setStation] = useState("C04");
  const [steps, setSteps] = useState(24);
  const [apiData, setApiData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [yearsAvailable, setYearsAvailable] = useState([]);
  const [monthsAvailable, setMonthsAvailable] = useState([]);
  const [selectedYear, setSelectedYear] = useState("Año");
  const [selectedMonth, setSelectedMonth] = useState("Mes");
  const [summary, setSummary] = useState("");
  const [recommendation, setRecommendation] = useState([]);
  const [cargandoRecomendacion, setCargandoRecomendacion] = useState(false);
  const [riesgo, setRiesgo] = useState("");
  const [selectedVariable, setSelectedVariable] = useState("temperatura");
  const [selectedYearsCompare, setSelectedYearsCompare] = useState([]);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/historical/${station}`);
        const data = res.data.data
          .filter(d => d.fecha && !isNaN(new Date(d.fecha).getTime()))
          .map(d => ({
            ...d,
            temperatura: Number(d.temperatura) || 0,
            humedad: Number(d.humedad) || 0,
            viento_velocidad: Number(d.viento_velocidad) || 0,
            viento_direccion: Number(d.viento_direccion) || 0,
            precipitacion: Number(d.precipitacion) || 0
          }));

        setHistoricalData(data);
        const years = [...new Set(data.map(d => new Date(d.fecha).getFullYear().toString()))];
        setYearsAvailable(years.sort());
        setFilteredData([]);
      } catch (err) {
        console.error("Error al cargar datos históricos:", err);
      }
    };

    const fetchLiveWeather = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/weather?station=${station}`);
        setApiData(res.data);
      } catch (err) {
        console.error("Error al cargar clima en tiempo real:", err);
      }
    };


    fetchHistoricalData();
    fetchLiveWeather();
    const interval = setInterval(fetchLiveWeather, 60000); // cada 60 segundos

    return () => clearInterval(interval);
  }, [station]);

  useEffect(() => {
    let filtered = [...historicalData];
    if (selectedYear !== "Año") {
      filtered = filtered.filter(d => new Date(d.fecha).getFullYear().toString() === selectedYear);
      const months = [...new Set(filtered.map(d => new Date(d.fecha).getMonth()))];
      setMonthsAvailable(months.sort((a, b) => a - b));

    } else {
      setMonthsAvailable([]);
      setFilteredData([]);
      return;
    }
    if (selectedMonth !== "Mes") {
      filtered = filtered.filter(d => new Date(d.fecha).getMonth().toString() === selectedMonth);
    }
    setFilteredData(filtered);
  }, [historicalData, selectedYear, selectedMonth]);


  const reducedData = filteredData.length > 1000 ? filteredData.filter((_, index) => index % 10 === 0) : filteredData;

  const getComparisonData = () => {
    const result = {};
    selectedYearsCompare.forEach((year) => {
      const yearData = historicalData
        .filter(d => new Date(d.fecha).getFullYear().toString() === year)
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

      const step = Math.max(1, Math.floor(yearData.length / 200));
      yearData.filter((_, idx) => idx % step === 0).forEach(d => {
        const date = new Date(d.fecha);
        const monthAbbr = date.toLocaleString('es-ES', { month: 'short' });
        const label = date.toISOString().slice(5, 10);
        if (!result[label]) result[label] = { label };
        if (typeof d[selectedVariable] === "number" && !isNaN(d[selectedVariable])) {
          result[label][`y${year}`] = d[selectedVariable];
        }
      });
    });
    return Object.values(result).sort((a, b) => new Date(`${a.label} 2020`) - new Date(`${b.label} 2020`));
  };

  const variablePalettes = {
    general: [
      "#1d4ed8", "#10b981", "#f43f5e", "#f59e0b", "#6366f1", "#ec4899", "#8b5cf6", "#f97316", "#14b8a6", "#a855f7"
    ],
    temperatura: ["#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8"],
    humedad: ["#fcd34d", "#fbbf24", "#f59e0b", "#d97706"]
  };

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const getRecommendation = async (resultado) => {
    setCargandoRecomendacion(true);

    try {
      const res = await fetch("http://localhost:8000/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entradas: resultado.predicciones.map(p => ({
            fecha: p.fecha,
            precipitacion_predicha_mm: p.precipitacion_predicha_mm
          }))
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Error desconocido");
      }

      const data = await res.json();
      setRecommendation(data);
    } catch (error) {
      console.error("❌ Error al obtener recomendación:", error.message);
      setRecommendation([]);
    } finally {
      setCargandoRecomendacion(false);
    }
  };


  // Al recibir predicción desde el hijo, se actualiza estado y se recomienda
  const handlePrediccion = (res) => {
    setResultado(res);
    getRecommendation(res);
  };
  return (

    <div className="bg-gray-50 border border-gray-300 shadow-md rounded-xl p-5 mb-6">
      <div className="flex justify-between mb-4">
        <div>
          <label className="font-medium">Código estación: </label>
          <input
            type="text"
            value={station}
            onChange={(e) => setStation(e.target.value)}
            className="border p-1 ml-2 rounded"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border p-1 rounded"
          >
            <option>Año</option>
            {yearsAvailable.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border p-1 rounded"
            disabled={monthsAvailable.length === 0}
          >
            <option>Mes</option>
            {monthsAvailable.map((month) => (
              <option key={month} value={month}>
                {new Date(0, month).toLocaleString('es-ES', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
      </div>
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <BiBarChart className="text-blue-600 text-2xl" />
        Visualización Histórica
      </h2>
      {reducedData.length > 0 ? (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[{ key: 'temperatura', label: 'Temperatura (°C)', color: '#f97316', max: 18, min: 4 },
          { key: 'humedad', label: 'Humedad (%)', color: '#3b82f6', max: 100, min: 35 }].map((cfg, idx) => (
            <div key={idx} className="bg-white p-4 shadow rounded">
              <h3 className="font-semibold text-center">{cfg.label}</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={reducedData}>
                  <XAxis dataKey="fecha" tickFormatter={(tick) => {
                    const [month] = tick.split("-"); const monthIndex = parseInt(month, 10) - 1;
                    return new Date(tick).toLocaleString('es-ES', { month: 'short' })
                  }} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey={cfg.key} stroke={cfg.color} strokeWidth={1.5} dot={{ r: 2, stroke: '#000', strokeWidth: 0.5, fill: cfg.color }} />
                  <ReferenceLine y={cfg.max} stroke="orange" label={{ value: `U S: ${cfg.max}`, position: 'top', fill: 'orange' }} />
                  <ReferenceLine y={cfg.min} stroke="blue" label={{ value: `U I: ${cfg.min}`, position: 'bottom', fill: 'blue' }} />
                  <Brush dataKey="fecha" height={20} stroke="#8884d8" travellerWidth={10}
                    tickFormatter={(tick) => {
                      const date = new Date(tick);
                      return date.toLocaleString("es-ES", { month: "short" });
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
          <div className="bg-white p-4 shadow rounded h-[292px] flex flex-col items-center justify-between">
            <h3 className="font-semibold text-center mb-2">Viento (dirección y velocidad)</h3>
            <div className="w-full h-[220px] overflow-hidden">
              <WindChart stationCode={station} year={selectedYear} month={selectedMonth} />
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-gray-500">Selecciona año y mes para visualizar datos.</p>
      )}

      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="col-span-2">
          <MapStations onSelectStation={(code) => setStation(code)} scrollWheelZoom={false} dragging={false} doubleClickZoom={false} />
        </div>
        <div className="flex flex-col gap-4">
          {apiData && (
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <WiThermometer className="text-orange-500 text-2xl" />
                Estado Actual
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <WiThermometer className="text-2xl text-orange-500" />
                  <div>
                    <p className="text-2xl font-semibold">{apiData.temperatura}°C</p>
                    <p>Temperatura</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <WiHumidity className="text-2xl text-blue-500" />
                  <div>
                    <p className="text-2xl font-semibold">{apiData.humedad}%</p>
                    <p>Humedad</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <WiRaindrop className="text-2xl text-cyan-500" />
                  <div>
                    <p className="text-2xl font-semibold">{apiData.precipitacion} mm</p>
                    <p>Precipitación</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <WiStrongWind className="text-2xl text-green-500" />
                  <div>
                    <p className="text-2xl font-semibold">{apiData.viento} m/s</p>
                    <p>Viento</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow-lg rounded-xl p-6">
            <h3 className="text-xl font-bold mb-2">Comparador Histórico</h3>
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-1">Variable:</h4>
              <div className="flex gap-4 mb-2">
                {['temperatura', 'humedad'].map((v) => (
                  <label key={v} className="flex items-center gap-1 text-sm">
                    <input type="radio" name="variable" value={v} checked={selectedVariable === v} onChange={() => setSelectedVariable(v)} />
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </label>
                ))}
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-1">Años:</h4>
                <div className="flex flex-wrap gap-3">
                  {yearsAvailable.map((year, index) => {
                    const isSelected = selectedYearsCompare.includes(year);
                    const color = variablePalettes[selectedVariable][index % variablePalettes[selectedVariable].length];
                    return (
                      <label key={year} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={isSelected} onChange={() =>
                          setSelectedYearsCompare((prev) =>
                            isSelected ? prev.filter((y) => y !== year) : [...prev, year]
                          )} />
                        <span>{year}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {selectedYearsCompare.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={getComparisonData()}>
                  <XAxis
                    dataKey="label"
                    tickFormatter={(tick) => {
                      const [month] = tick.split("-");
                      const monthIndex = parseInt(month, 10) - 1;
                      return new Date(2000, monthIndex).toLocaleString("es-ES", { month: "short" });
                    }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedYearsCompare.map((year, i) => (
                    <Line
                      key={year}
                      type="monotone"
                      dataKey={`y${year}`}
                      name={`${selectedVariable.charAt(0).toUpperCase() + selectedVariable.slice(1)} (${year})`}
                      stroke={variablePalettes.general[i % variablePalettes.general.length]}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false} connectNulls={true}
                    />
                  ))}
                  <Brush dataKey="label" height={20} stroke="#8884d8" travellerWidth={10}
                    tickFormatter={(tick) => {
                      const date = new Date(tick);
                      return date.toLocaleString("es-ES", { month: "short" });
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-sm">Selecciona al menos un año.</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Modelo Predictivo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna izquierda: componente con formulario */}
          <div>
            <PrecipitationPredictor onPredict={handlePrediccion} />
          </div>

          {/* Columna derecha: resultado o explicación visual */}
          <div className="bg-blue-50 p-4 rounded-lg shadow-md flex flex-col justify-center items-center">
            <h4 className="text-lg font-semibold mb-2 text-blue-800">Indicador de Precipitación</h4>
            {cargandoRecomendacion && (
              <p className="text-gray-600 italic animate-pulse">⏳ Generando recomendaciones, por favor espere...</p>
            )}

            {recommendation.length > 0 && (
              <div className="flex flex-col gap-4 items-center w-full">
                {recommendation.map((item, idx) => (
                  <div
                    key={idx}
                    className="w-full bg-white p-4 rounded shadow text-center text-sm text-gray-800"
                  >
                    <h5 className="text-blue-800 font-semibold mb-1">
                      {item.fecha}
                    </h5>

                    <p className={`mt-1 font-semibold ${item.riesgo === "Alto"
                      ? "text-red-600"
                      : item.riesgo === "Moderado"
                        ? "text-yellow-600"
                        : "text-green-600"
                      }`}>
                      Riesgo: {item.riesgo}
                    </p>

                    <div className="mt-2 p-2 bg-blue-50 rounded">
                      🧠 {item.recomendacion}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Gráfico de predicción (solo si hay resultado) */}

        <hr className="my-6" />
      </div>


    </div>
  );
};

export default RainPredictionComponent;