from pydantic import BaseModel
import joblib
import pandas as pd
import os
from sklearn.metrics import mean_absolute_percentage_error

# Cargar modelo SARIMA
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'model', 'sarima_precipitacion_personalizable.pkl')
model = joblib.load(MODEL_PATH)

# Cargar datos históricos
CSV_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'precipitacion_mensual_total_modificado.csv')
df = pd.read_csv(CSV_PATH, parse_dates=["Fecha"])
df.set_index("Fecha", inplace=True)

# Pydantic para la entrada
class PrecipitationRangeInput(BaseModel):
    fecha_inicio: str  # formato 'YYYY-MM'
    fecha_fin: str     # formato 'YYYY-MM'

def predict_precipitacion_range(datos: PrecipitationRangeInput):
    # Entrenamiento y proyección completa desde 2020
    start_date = pd.to_datetime("2020-01")
    end_date = pd.to_datetime(datos.fecha_fin)

    steps = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month) + 1
    prediction_index = pd.date_range(start=start_date, periods=steps, freq='MS')

    # Hacer predicción
    forecast = model.get_prediction(start=prediction_index[0], end=prediction_index[-1])
    predicted = forecast.predicted_mean
    conf_int = forecast.conf_int()

    # Calcular efectividad si hay datos reales
    real = df["Precipitacion"].reindex(prediction_index).dropna()
    aligned = predicted.reindex(real.index)
    if not real.empty and len(real) == len(aligned):
        mape = mean_absolute_percentage_error(real, aligned)
        efectividad = round((1 - mape) * 100, 2)
    else:
        efectividad = None

    # Filtrar solo los meses solicitados por el usuario
    user_start = pd.to_datetime(datos.fecha_inicio)
    user_end = pd.to_datetime(datos.fecha_fin)
    filtered_index = [fecha for fecha in prediction_index if user_start <= fecha <= user_end]

    # Construir respuesta solo del rango deseado
    resultados = []
    for fecha in filtered_index:
        real_val = df["Precipitacion"].get(fecha, None)
        pred_val = predicted.get(fecha, None)
        resultados.append({
            "fecha": fecha.strftime("%Y-%m"),
            "precipitacion_real_mm": round(real_val, 2) if pd.notna(real_val) else None,
            "precipitacion_predicha_mm": round(pred_val, 2) if pd.notna(pred_val) else None,
            "limite_inferior": round(conf_int.loc[fecha].iloc[0], 2) if fecha in conf_int.index else None,
            "limite_superior": round(conf_int.loc[fecha].iloc[1], 2) if fecha in conf_int.index else None
        })

    return {
        "predicciones": resultados,
        "precision_modelo": efectividad
    }
