import React from "react";

const AboutModel = () => {
  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Sobre el modelo y contexto</h2>

      <p className="mb-6 text-gray-700">
        Este sistema utiliza un modelo estadístico <strong>SARIMA (Seasonal AutoRegressive Integrated Moving Average)</strong>, que permite capturar patrones estacionales y tendencias en series de tiempo mensuales. El modelo se entrena con datos históricos de precipitaciones en Quito, permitiendo realizar predicciones personalizadas de acumulación mensual y generar recomendaciones preventivas en base a niveles de riesgo.
      </p>

      <h3 className="text-xl font-semibold text-gray-800 mb-4">🌪️ Eventos extremos registrados en Quito</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta 1 */}
        <div className="bg-blue-50 p-4 rounded-lg shadow-md">
          <h4 className="text-lg font-bold text-blue-700 mb-2">Inundación en La Gasca (31 de enero de 2022)</h4>
          <p className="text-sm text-gray-700">
            Una lluvia de más de 75 mm provocó el desbordamiento de quebradas en el sector de La Gasca, generando una avalancha de lodo. Lamentablemente murieron al menos 28 personas.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Fuente: <a href="https://www.eluniverso.com/noticias/ecuador/quito-registra-inundaciones-y-deslaves-en-sector-de-la-gasca-por-lluvia-en-la-tarde-de-este-31-de-enero-nota/" target="_blank" rel="noopener noreferrer" className="underline">El Universo</a>
          </p>
        </div>

        {/* Tarjeta 2 */}
        <div className="bg-yellow-50 p-4 rounded-lg shadow-md">
          <h4 className="text-lg font-bold text-yellow-700 mb-2">Granizada en el Centro Histórico (marzo de 2023)</h4>
          <p className="text-sm text-gray-700">
            Una intensa granizada cubrió calles y plazas, afectando techos, vehículos y causando anegaciones en varias viviendas. El espesor de hielo superó los 10 cm en algunos sectores.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Fuente: <a href="https://www.primicias.ec/noticias/ecuador/granizada-centro-historico-quito-marzo-2023/" target="_blank" rel="noopener noreferrer" className="underline">Primicias</a>
          </p>
        </div>

        {/* Tarjeta 3 */}
        <div className="bg-red-50 p-4 rounded-lg shadow-md">
          <h4 className="text-lg font-bold text-red-700 mb-2">Deslizamiento en El Troje (marzo de 2017)</h4>
          <p className="text-sm text-gray-700">
            Fuertes lluvias provocaron un deslizamiento que bloqueó el canal de agua potable en El Troje, dejando sin agua a cerca de 600 mil quiteños por más de 48 horas.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Fuente: <a href="https://www.elcomercio.com/actualidad/quito-deslizamiento-troje-emaseo-agua.html" target="_blank" rel="noopener noreferrer" className="underline">El Comercio</a>
          </p>
        </div>

        {/* Tarjeta 4 */}
        <div className="bg-green-50 p-4 rounded-lg shadow-md">
          <h4 className="text-lg font-bold text-green-700 mb-2">Temporada de lluvias (abril de 2021)</h4>
          <p className="text-sm text-gray-700">
            Quito vivió una temporada lluviosa intensa, con múltiples reportes de árboles caídos, vías anegadas y viviendas afectadas en el sur de la ciudad.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Fuente: <a href="https://www.eltelegrafo.com.ec/noticias/quito/1/quito-temporada-lluvias-reportes" target="_blank" rel="noopener noreferrer" className="underline">El Telégrafo</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutModel;
