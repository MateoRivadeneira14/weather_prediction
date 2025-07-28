import React, { useState } from "react";
import axios from "axios";
import PrecipitationVisualizer from "./PrecipitationVisualizer";

const PrecipitationPredictor = ({ onPredict }) => {
    const [fechaInicio, setFechaInicio] = useState("2025-01");
    const [fechaFin, setFechaFin] = useState("2025-12");
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState(null);
    const [mostrarGrafico, setMostrarGrafico] = useState(false);

    const handlePredict = async () => {
        try {
            const res = await axios.post("http://localhost:8000/predict", {
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
            });

            const datos = res.data;
            setResultado(datos);
            setError(null);
            setMostrarGrafico(true);

            // 🔁 Enviar resultado al padre
            if (typeof onPredict === "function") {
                onPredict(datos);
            }

        } catch (err) {
            console.error("❌ Error al obtener la predicción:", err.response?.data || err.message);
            setError("Error al obtener la predicción.");
            setResultado(null);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow p-6 max-w-xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Predicción de Precipitación (Rango Personalizado)</h2>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium">Desde (YYYY-MM)</label>
                    <input
                        type="month"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        className="border rounded p-2 w-full"
                        min="2020-01"
                        max="2025-12"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Hasta (YYYY-MM)</label>
                    <input
                        type="month"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className="border rounded p-2 w-full"
                        min="2020-01"
                        max="2025-12"
                    />
                </div>
            </div>

            <button onClick={handlePredict} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
                Predecir
            </button>

            {resultado && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">📈 Resultados:</h3>
                    <table className="w-full text-sm border rounded shadow">
                        <thead>
                            <tr className="bg-blue-100">
                                <th className="p-2 border">Fecha</th>
                                <th className="p-2 border">Predicción (mm)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resultado.predicciones
                                .filter(item => item.fecha >= fechaInicio && item.fecha <= fechaFin)
                                .map((item, idx) => (
                                    <tr key={idx} className="text-center">
                                        <td className="p-2 border">{item.fecha}</td>
                                        <td className="p-2 border">{item.precipitacion_predicha_mm}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                    {resultado.precision_modelo !== null && (
                        <p className="text-sm text-gray-600 mt-2">
                            📊 Precisión del modelo: <strong>{resultado.precision_modelo}%</strong>
                        </p>
                    )}
                </div>
            )}

            {mostrarGrafico && (
                <PrecipitationVisualizer intervalo={{ desde: fechaInicio, hasta: fechaFin }} />
            )}

            {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>
    );
};

export default PrecipitationPredictor;
