from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scripts import recommendation_api
from loaders.csv_loader import load_station_data
from data.weather_api import get_weather_data
from scripts.precipitation_predictor import predict_precipitacion_range, PrecipitationRangeInput
from scripts.recommendation_api import router as recommendation_router
import os
import json 

app = FastAPI()

# ✅ Agregar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://184.72.86.112:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(recommendation_router)

class PredictRequest(BaseModel):
    station: str
    days_ahead: int

class RecommendRequest(BaseModel):
    probability_rain: float
    days_ahead: int

@app.get("/weather")
def weather(station: str = Query("C04")):
    try:
        data = get_weather_data(station)
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/wind-data/{station_code}")
def get_wind_data(station_code: str):
    try:
        df = load_station_data(station_code)

        # Verificación explícita
        if "viento_velocidad" not in df.columns or "viento_direccion" not in df.columns:
            raise HTTPException(status_code=500, detail="❌ No se encontraron columnas de viento en los datos.")

        wind_df = df[["fecha", "viento_velocidad", "viento_direccion"]].dropna().tail(100)
        return {"data": wind_df.to_dict(orient="records")}

    except Exception as e:
        print("❌ Error en /wind-data:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict")
def predict(data: PrecipitationRangeInput):
    return predict_precipitacion_range(data)

@app.get("/predicciones-visualizacion")
def obtener_datos_visualizacion():
    ruta = os.path.join(os.path.dirname(__file__), "data", "predicciones_visualizacion.json")
    with open(ruta, "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/stations")
def get_stations():
    return [
        {"code": "C04", "name": "Rumipamba", "lat": -0.20, "lon": -78.49},
        {"code": "C05", "name": "Bellavista", "lat": -0.18, "lon": -78.47},
        {"code": "C19", "name": "El Troje", "lat": -0.33, "lon": -78.52},
        {"code": "C20", "name": "Calderon", "lat": -0.07, "lon": -78.43}
    ]

@app.get("/historical/{station_code}")
def get_historical_data(station_code: str):
    df = load_station_data(station_code)
    return {"data": df.to_dict(orient="records")}
