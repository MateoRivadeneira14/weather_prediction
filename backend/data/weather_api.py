import requests

# Diccionario de coordenadas por código de estación
station_coordinates = {
    "C04": {"lat": -0.2299, "lon": -78.5249},  # Quito
    "C05": {"lat": -0.1900, "lon": -78.4900},  # Otro ejemplo
    # Agrega más estaciones aquí según tus datos
}

def get_weather_data(station_code="C04"):
    api_key = "93dad08f6ef86baaf176eba33875bb32"  # Usa variable de entorno en producción

    coords = station_coordinates.get(station_code)
    if not coords:
        raise ValueError(f"Coordenadas no definidas para estación {station_code}")

    url = (
        f"http://api.openweathermap.org/data/2.5/weather?"
        f"lat={coords['lat']}&lon={coords['lon']}&appid={api_key}&units=metric"
    )

    response = requests.get(url)
    data = response.json()


    return {
        "temperatura": data["main"]["temp"],
        "humedad": data["main"]["humidity"],
        "viento": data["wind"]["speed"],
        "precipitacion": data.get("rain", {}).get("1h", 0),
        "radiacion": 500  # Valor simulado si no lo tienes
    }