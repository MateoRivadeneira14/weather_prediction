import os
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter()

# ✅ Clasificación de riesgo
def clasificar_riesgo(mm: float) -> str:
    if mm < 20:
        return "Bajo"
    elif 20 <= mm <= 150:
        return "Moderado"
    else:
        return "Alto"

# Entrada por mes (altitud ahora es opcional)
class RecommenderEntry(BaseModel):
    fecha: str
    precipitacion_predicha_mm: float

# Entrada por lote
class RecommenderBatchInput(BaseModel):
    entradas: list[RecommenderEntry]

@router.post("/recommend")
def generate_batch_recommendation(data: RecommenderBatchInput):
    try:
        model = genai.GenerativeModel("models/gemini-1.5-pro-latest")
        recomendaciones = []

        for entrada in data.entradas:
            riesgo = clasificar_riesgo(entrada.precipitacion_predicha_mm)
            anio, mes = entrada.fecha.split("-")

            # Mensaje base
            prompt = (
                f"Soy un sistema de predicción climática para Quito, Ecuador. "
                f"Para el mes de {mes} del año {anio}, se estima una precipitación mensual acumulada de "
                f"{entrada.precipitacion_predicha_mm} mm. Este valor corresponde a un nivel de riesgo {riesgo} "
                f"en función de amenazas hidrometeorológicas. "
                f"Genera una recomendación preventiva breve y clara para la ciudadanía, considerando posibles impactos como "
                f"inundaciones urbanas, deslizamientos de tierra o problemas en infraestructura. "
                f"La recomendación debe estar en español y orientada a prevenir emergencias en zonas vulnerables de Quito."
            )

            response = model.generate_content(prompt)

            recomendaciones.append({
                "fecha": entrada.fecha,
                "riesgo": riesgo,
                "recomendacion": response.text.strip()
            })

        return recomendaciones

    except ResourceExhausted:
        raise HTTPException(status_code=429, detail="Cuota de Gemini API superada. Intenta más tarde.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
