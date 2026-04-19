from weasyprint import HTML

# Conteúdo do arquivo de texto
content = """# MERMAID FLOWCHART - GUIA RÁPIDO PARA NEOVIM
# Salve este arquivo como mermaid_help.txt para consulta

DIREÇÃO DO FLUXO
================
graph TD  --> Cima para Baixo (Top Down)
graph BT  --> Baixo para Cima (Bottom Up)
graph LR  --> Esquerda para Direita (Left to Right)
graph RL  --> Direita para Esquerda (Right to Left)

FORMAS DOS NODES (BLOCOS)
=========================
[Texto]     --> Retângulo (Padrão)
{Texto}     --> Losango (Decisão/IF)
((Texto))   --> Círculo (Sucesso/Fim)
([Texto])   --> Oval/Estádio (Início/Fim)
[(Texto)]   --> Cilindro (Database)
[[Texto]]   --> Processo Subjacente
>Texto]     --> Banner/Evento
[/Texto/]   --> Paralelogramo (Input/Output)
[\\Texto\\]   --> Paralelogramo Inverso

CONEXÕES (SETAS)
================
A --> B     --> Seta simples
A --- B     --> Linha sem seta
A -- Texto --> B   --> Seta com texto no meio
A --|Texto| B      --> Seta com texto (estilo alternativo)
A ==> B     --> Seta grossa (Espessa)
A -.-> B    --> Seta pontilhada
A --o B     --> Seta com círculo na ponta
A --x B     --> Seta com 'X' na ponta (Indica erro/bloqueio)

EXEMPLO DE DECISÃO (LOSANGO)
============================
graph TD
    E[Início] --> D{Está funcionando?}
    D -- Sim --> F((Sucesso))
    D -- Não --> G[Corrigir Erro]
    G --> D

DICA PARA NEOVIM
================
No Neovim, certifique-se de envolver o código assim:
```mermaid
graph TD
    ... código aqui ...
