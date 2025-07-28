import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate("/dashboard");
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-100 to-blue-300 text-center p-6">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">🌧️ Bienvenidos al Sistema de visualización y predicción climática ante eventos extremos urbanos en Quito</h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-8">
                Explora visualizaciones detalladas del clima de Quito, predicciones de precipitación mensual con modelos avanzados y recibe recomendaciones generadas por IA para prevenir eventos extremos.
            </p>
            <button
                onClick={handleStart}
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-6 py-3 rounded-xl shadow-md transition"
            >
                Empezar
            </button>
        </div>
    );
};

export default LandingPage;
