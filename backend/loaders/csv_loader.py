import pandas as pd
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

def load_station_data(station_code):
    station_dir = os.path.join(DATA_DIR, station_code)

    def read_and_check(path, var_name):
        df = pd.read_csv(path, parse_dates=['fecha'])
        if "valor" not in df.columns:
            raise ValueError(f"❌ Archivo {path} no contiene columna 'valor'. Columnas encontradas: {list(df.columns)}")
        return df.rename(columns={"valor": var_name})

    temp_df = read_and_check(os.path.join(station_dir, f"{station_code}-Temperatura.csv"), "temperatura")
    hum_df = read_and_check(os.path.join(station_dir, f"{station_code}-Humedad.csv"), "humedad")
    prec_df = read_and_check(os.path.join(station_dir, f"{station_code}-Precipitación.csv"), "precipitacion")
    viento_df = read_and_check(os.path.join(station_dir, f"{station_code}-Velocidad_de_viento.csv"), "viento_velocidad")
    dir_df = read_and_check(os.path.join(station_dir, f"{station_code}-Direccion.csv"), "viento_direccion")

    df = temp_df[['fecha', 'temperatura']]
    df = df.merge(hum_df[['fecha', 'humedad']], on='fecha', how='outer')
    df = df.merge(prec_df[['fecha', 'precipitacion']], on='fecha', how='outer')
    df = df.merge(viento_df[['fecha', 'viento_velocidad']], on='fecha', how='outer')
    df = df.merge(dir_df[['fecha', 'viento_direccion']], on='fecha', how='outer')

    df = df.sort_values("fecha")
    df = df.fillna(0)

    return df
