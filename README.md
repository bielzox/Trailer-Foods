# Trailer Foods – instaladores (PC e celular)

## Estrutura
- `index.html` + `cardapio.js` → Cardápio (cliente)
- `admin/` → Painel Admin (`admin.html`, `admin.js`, `admin-main.js`, `electron-builder.admin.json`, `gerar-instalador-admin.bat`)
- `main.js`, `preload.js`, `package.json` → app de PC (Electron)
- `manifest.webmanifest`, `sw.js`, `icone-192.png`, `icone-512.png` → instalação no celular (PWA)
- `logo.png` → logo original; `icone.png` / `icone.ico` / `icone-*.png` são gerados dela
- `Imagens/` (logo2, logo fundo, PSD) · `backups/` · `setup.sql` · `admin-bootstrap.sql` · `admin-access-requests.sql` · `supabase.js`

## Configuração do Supabase
`config.js` contém a URL do projeto e a chave **publishable** (pública, própria para uso no navegador) do Supabase. Ela não é uma senha e não concede privilégios administrativos: mantenha RLS e as políticas do `setup.sql` ativas. Nunca coloque uma chave `service_role` ou `sb_secret_` nesse arquivo. Para usar outro projeto, copie `config.example.js` para `config.js` e preencha **Project URL** e a chave publicável.

## Gerar os instaladores do Trailer Foods
Dê dois cliques em **`gerar-instalador.bat`** (precisa do Node.js LTS e de internet na 1ª vez).
- Opção 1: Cardápio e Admin (PC) · 2: só Cardápio (PC) · 3: só Admin (PC)
- Saída: `instalador/` (Cardápio) e `instalador-admin/` (Admin)
- Só o Admin: `admin/gerar-instalador-admin.bat`

## Celular (Android / iPhone)
O celular instala pelo navegador e exige endereço **https**. Publique os arquivos web do projeto em um serviço de hospedagem estática e abra:
- Cardápio: `https://seu-site/`
- Admin: `https://seu-site/admin/`

Android (Chrome): menu ⋮ → *Instalar app*. iPhone (Safari): Compartilhar → *Adicionar à Tela de Início*.

## Testar sem instalar
`testar-sem-instalar.bat` → http://localhost:8000/index.html e /admin/admin.html (usa o mesmo Supabase do `config.js`)

## Configurar o banco (Supabase) — obrigatório
1. Crie um projeto grátis em supabase.com.
2. **SQL Editor → New query**: cole o conteúdo de `setup.sql` e rode.
   Em projetos já configurados, rode novamente a versão atualizada de `setup.sql` no mesmo projeto indicado por `SUPABASE_URL` em `config.js`. Isso cria o bucket privado `admin-avatars` e suas políticas sem apagar os dados existentes; é necessário para trocar a foto de perfil.
3. Em **Authentication → Users → Add user**, crie a conta do primeiro administrador com uma senha forte e única. Marque *Auto Confirm User* para liberar o primeiro acesso imediatamente.
4. No SQL Editor, substitua `SEU_EMAIL_ADMIN` em `admin-bootstrap.sql` pelo e-mail dessa conta e rode o script. Ele falha claramente se o usuário ainda não existir e pode ser executado novamente.
5. No SQL Editor, rode também o conteúdo atualizado de `admin-access-requests.sql`. Isso ativa cadastro com confirmação de e-mail, perfis sincronizados para a aba **Acessos** e aprovação restrita a administradores. Se a migração já foi aplicada, rode novamente a versão atual para criar/preencher `admin_profiles` e instalar as funções atuais.
6. Em **Authentication → URL Configuration**, configure a URL do painel Admin nas URLs permitidas para redirecionamento. Mantenha a confirmação de e-mail ativada em **Authentication → Providers → Email**.
7. **Project Settings → API**: copie *Project URL* e a chave **anon public** para o `config.js` (nunca a `service_role`).
8. Gere os instaladores de novo e republique os arquivos web do projeto, se aplicável. No painel, **Criar nova conta** envia uma solicitação; o usuário confirma o e-mail e um admin aprova em **Acessos**. Também é possível aprovar um e-mail diretamente: se a conta ainda não existir, a autorização fica salva e o acesso Admin é ativado após cadastro e confirmação do mesmo e-mail. A bolinha de conta permite editar nome e foto, trocar senha e sair da conta.

### Atualizações instantâneas
- O cardápio recebe alterações de produtos, categorias e personalização sem recarregar a página.
- O painel recebe pedidos, produtos, categorias, gastos, personalização e solicitações de acesso em tempo real; se o Realtime desconectar, busca novamente os dados até reconectar.
- Para ativar em projetos existentes, execute novamente `setup.sql` e `admin-access-requests.sql` no mesmo projeto Supabase. O painel precisa estar publicado em HTTP/HTTPS; `file://` não oferece a conexão Realtime necessária.

### Cadastro, login ou e-mail de confirmação
- O cadastro registra a solicitação no banco via trigger, sem depender de uma segunda chamada do navegador. A chamada Auth é interrompida após 20 segundos e o botão é liberado; em timeout, confira **Authentication → Users** antes de tentar novamente, pois a conta pode ter sido criada sem a resposta chegar.
- Se a tela informar que a conta foi criada sem exigir confirmação, o projeto está com confirmação de e-mail desativada e não enviará esse e-mail. Para receber links de confirmação, habilite a confirmação em **Authentication → Providers → Email**.
- Se aparecer **Invalid login credentials**, confira e-mail e senha; use **Esqueci a senha** para receber um link de redefinição ou **Reenviar confirmação** para solicitar novamente o e-mail de confirmação.
- Para o envio de e-mails, confira **Authentication → Providers → Email**, os templates de confirmação, a URL de redirecionamento em **Authentication → URL Configuration**, limites de envio e logs de Auth. O SMTP padrão do Supabase pode ser limitado; para entrega confiável configure um SMTP próprio em **Project Settings → Authentication → SMTP Settings**. Confira também spam/lixo eletrônico.
- Para mostrar todos os perfis (nome, e-mail e foto) na aba **Acessos**, execute novamente `setup.sql` e `admin-access-requests.sql` atualizados. A leitura dos perfis e das fotos é restrita a administradores.
- Confirme se o projeto Supabase está ativo e verifique **Project Status** e os logs de **Authentication** no Dashboard.
- Para solicitações de acesso, execute `setup.sql` e depois `admin-access-requests.sql` no mesmo projeto configurado em `config.js`.
- Na aba **Acessos**, use **Aprovar** ao lado do pedido ou **Aprovar acesso admin** e informe o e-mail. A autorização é salva mesmo que a conta ainda não exista; o acesso Admin só é ativado depois que a pessoa criar a conta com esse e-mail e confirmá-lo.
- Para uma conta já existente, a aprovação é aplicada imediatamente se o e-mail já estiver confirmado; caso contrário, será aplicada quando o endereço for confirmado. A aprovação não confirma o endereço no Supabase.
- Se houve HTTP 504 durante o cadastro, verifique **Authentication → Users** antes de tentar novamente: a conta pode ter sido criada mesmo sem a resposta chegar ao painel.
- Se a conta já existir após um timeout, confirme o e-mail e entre uma vez no painel; o login verificará e registrará a solicitação pendente em **Acessos**.
- O painel informa o resultado e libera o botão após a resposta ou após 30 segundos. Um HTTP 504 do servidor Supabase não pode ser corrigido pelo navegador; se persistir, verifique o status do serviço e os logs do projeto.

Arquivos: `supabase.js` (biblioteca oficial, v2.119.0, embutida para funcionar no app de PC) e `config.js` (suas chaves).
