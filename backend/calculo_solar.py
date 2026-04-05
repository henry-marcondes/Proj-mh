# backend/calculos_solar.

CLIMA_EFICIENCIA = {
    "sol": 1.0,
    "nublado": 0.4,
    "chuva": 0.1
}

def simular_dia_sequencial(
    potencia_painel_w,
    capacidade_bateria_ah,
    lista_equipamentos,
    lista_fontes_geracao,
    clima="sol",
    carga_inicial_wh=None,
    tensao=12
):
    capacidade_maxima_wh = capacidade_bateria_ah * tensao

        # 🔋 Estado inicial da bateria
    energia_bateria_atual = ( capacidade_maxima_wh if carga_inicial_wh is None else carga_inicial_wh)

    eficiencia_clima = CLIMA_EFICIENCIA.get(clima, 1.0)
    dados_dia = []

    for hora in range(24):
    # ☀️ GERAÇÃO SOLAR
        if 6 <= hora <= 18:
            fator_sol = max(0, 1 - abs(12 - hora) / 6)
            geracao_solar = potencia_painel_w * fator_sol * 0.7 * eficiencia_clima
        else:
            geracao_solar = 0

    # 🔋 CONSUMO
        consumo_hora = sum(
            eq['watts'] for eq in lista_equipamentos
            if eq['hora_inicio'] <= hora <= eq['hora_fim']
    )

    # 🔌 OUTRAS FONTES (AC-DC / DC-DC)
        geracao_extra = 0

        for fonte in lista_fontes_geracao or []:
            if fonte['hora_inicio'] <= hora <= fonte['hora_fim']:
                potencia_max = fonte['amperes'] * tensao

                if energia_bateria_atual >= capacidade_maxima_wh:
                    # 🔋 bateria cheia → só atende consumo restante
                    necessidade = max(0, consumo_hora - geracao_solar)
                    geracao_extra += min(potencia_max, necessidade)
                else:
                    # 🔋 bateria não cheia → gera tudo
                    geracao_extra += potencia_max

        # ⚡ GERAÇÃO TOTAL
        geracao_total = geracao_solar + geracao_extra

    # 🔋 CÁLCULO DO SALDO
        saldo_hora = geracao_total - consumo_hora

    # 🔋 ATUALIZAÇÃO DA BATERIA
        energia_bateria_atual = max(
        0,
        min(capacidade_maxima_wh, energia_bateria_atual + saldo_hora)
    )

    # 💸 DESPERDÍCIO (opcional, só quando bateria cheia)
        if energia_bateria_atual >= capacidade_maxima_wh:
            excesso = geracao_total - consumo_hora
            desperdicio = max(0, excesso)
        else:
            desperdicio = 0

        # 📊 SALVAR DADOS
        dados_dia.append({
            "hora": f"{hora:02d}:00",
            "geracao_solar": round(geracao_solar, 2),
            "geracao_extra": round(geracao_extra, 2),
            "geracao_total": round(geracao_total, 2),
            "consumo": round(consumo_hora, 2),
            "desperdicio": round(desperdicio, 2),
            "bateria_porcentagem": round((energia_bateria_atual / capacidade_maxima_wh) * 100, 2
        ),
            "bateria_wh_final": energia_bateria_atual
        })

    return dados_dia
