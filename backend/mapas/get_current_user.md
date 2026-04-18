### backend / auth.py --> 
 def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security),db: Session = Depends(get_db)):

---

Recebe da pagina HTTPAuthorizationCredentials e abre
o banco de dados do (get_db))

testa:
Token não é valido (erro 401)
Usuário não encontrado (erro 401)
Token invalido (erro 401)

Para Executar no Brower: $ :MarkdownPreview

---

```mermaid
graph TD
    A[Inicio: get credencial , db]--recebe as credencial e banco de dados-->B 
    B[try: imprime se recebeu Token] 
    B--> C{user_id}
    C--não recebeu-->D[erro 401]
    C--id correto-->E{User existe?}
    E--não exite-->F[erro 401]
    E--existe-->G{JT ERRO}
    G--token não bateu-->J[erro 401]
    G--return-->H[Usuário]
