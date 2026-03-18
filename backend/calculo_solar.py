# backend/calculos_solar.py

CLIMA_EFICIENCIA = {
    "sol": 1.0,      # 100% da geração estimada
    "nublado": 0.4,  # 40% de eficiência
    "chuva": 0.1     # 10% de eficiência
}

def simular_dia_sequencial(potencia_painel_w, capacidade_bateria_ah, lista_equipamentos, 
                           clima="sol", carga_inicial_wh=None, tensao=12):
    
    capacidade_maxima_wh = capacidade_bateria_ah * tensao
    
    # Se for o primeiro dia, começa cheio. Se for o dia seguinte, usa o saldo anterior.
    if carga_inicial_wh is None:
        energia_bateria_atual = capacidade_maxima_wh
    else:
        energia_bateria_atual = carga_inicial_wh

    eficiencia_clima = CLIMA_EFICIENCIA.get(clima, 1.0)
    dados_dia = []

    for hora in range(24):
        # Geração afetada pelo clima
        if 6 <= hora <= 18:
            fator_sol = max(0, 1 - abs(12 - hora) / 6)
            geracao_hora = potencia_painel_w * fator_sol * 0.7 * eficiencia_clima
        else:
            geracao_hora = 0

        # Consumo somado
        consumo_hora = sum(eq['watts'] for eq in lista_equipamentos if eq['hora_inicio'] <= hora <= eq['hora_fim'])

        # Atualização da Bateria
        saldo_hora = geracao_hora - consumo_hora
        energia_bateria_atual = max(0, min(capacidade_maxima_wh, energia_bateria_atual + saldo_hora))
        
        dados_dia.append({
            "hora": f"{hora:02d}:00",
            "geracao": round(geracao_hora, 2),
            "consumo": round(consumo_hora, 2),
            "bateria_porcentagem": round((energia_bateria_atual / capacidade_maxima_wh) * 100, 2),
            "bateria_wh_final": energia_bateria_atual
        })

    return dados_dia