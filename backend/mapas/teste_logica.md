### Minha Depuração Visual
Para Executar no Brower: $ :MarkdownPreview   

```mermaid
graph TD
    A0[/main.py/] --> A1
    A1[Simulado Ciclo-24] --Falta bloquear se não logar--> A2(User Logado)
    A2 -- falta testar a data --> A3{Data}
    A3 -- não --> A6[Fazer tela Erro]
    A3 --sim--> A4([Carrega itens])--> A7
    A4-- falta atualizar contagem limites --> A5[Dia +]

    A7 --> H[Fontes]
    A7 --> I[Equipamentos]
    A7([Já tem def: limites])

    B[/Verificar Fontes Antes de Fazer As Mudanças/] -->B1
    B1[ Services/auth.py def register ]


