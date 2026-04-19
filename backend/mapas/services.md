### Estrutura do plan_services.py 
Para Executar no Brower: $ :MarkdownPreview   

-----

### Regras de planos

-----

```mermaid
graph LR
    A0[get_user_plan]-->A1(Assinatura Ativa)-->A2(Plano existe?)
    B0[check_limit]-->B1(limites de objetos)
    B1-->B2(equipamentos)
    B1-->B3(fontes)
    B1-->B4(simulações)
    C0[ckeck_permission]-->C1(checar permissão)-->C3(falta especificar melhor o uso)
   
