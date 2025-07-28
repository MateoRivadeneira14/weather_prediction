import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import axios from "axios";

const WindChart = ({ stationCode = "C04", year = "Año", month = "Mes" }) => {
    const [windData, setWindData] = useState([]);

    useEffect(() => {
        axios
            .get(`http://184.72.86.112:8000/wind-data/${stationCode}`)
            .then((res) => {
                setWindData(res.data.data || []);
                console.log("💨 windData recibido:", res.data.data.length, res.data.data.slice(0, 5));
            })
            .catch((err) => console.error("Error al obtener datos de viento:", err));
    }, [stationCode]);

    // Filtrado según año y mes seleccionados
    const filteredData = windData.filter((d) => {
        const date = new Date(d.fecha);
        const dataYear = date.getFullYear();
        const dataMonth = date.getMonth() + 1;

        const matchYear = year !== "Año" ? dataYear === parseInt(year) : true;
        const matchMonth = month !== "Mes" ? dataMonth === parseInt(month) : true;

        console.log("🧪 Fecha cruda:", d.fecha, "→", dataYear, dataMonth);
        return matchYear && matchMonth;
    });

    console.log("🎯 filteredData:", filteredData.length, filteredData.slice(0, 5));
    const dataToPlot = filteredData.length > 0 ? filteredData : windData.slice(-100);
    if (dataToPlot.length === 0) return <p className="text-gray-500">Sin datos de viento disponibles.</p>;

    const last = dataToPlot[dataToPlot.length - 1];

    return (
        <div className="w-full h-[220px] overflow-hidden">
            <div style={{ width: "100%", height: "100%" }}>
                <Plot
                    data={[
                        {
                            type: "scatterpolar",
                            mode: "markers",
                            r: dataToPlot.map((d) => d.viento_velocidad),
                            theta: dataToPlot.map((d) => d.viento_direccion),
                            marker: { color: "lightblue", size: 6, opacity: 0.4 },
                            name: "Histórico",
                        },
                        {
                            type: "scatterpolar",
                            mode: "markers",
                            r: [last.viento_velocidad],
                            theta: [last.viento_direccion],
                            marker: { color: "blue", size: 12 },
                            name: `Último: ${last.viento_velocidad} m/s`,
                        },
                    ]}
                    layout={{
                        autosize: true,
                        width: undefined,
                        height: undefined,
                        margin: { t: 30, l: 20, r: 20, b: 20 },
                        polar: {
                            radialaxis: { visible: true, range: [0, 5] },
                            angularaxis: {
                                direction: "clockwise",
                                rotation: 90,
                                tickvals: [0, 90, 180, 270],
                                ticktext: ["N", "E", "S", "O"],
                            },
                        },
                        legend: {
                            orientation: "h",
                            x: 0,
                            y: -0.2,
                        },
                        showlegend: true,
                    }}
                    useResizeHandler={true}
                    style={{ width: "100%", height: "100%" }}
                    config={{ responsive: true }}
                />
            </div>
        </div>
    );

};

export default WindChart;
