# 🎓 Colégio Faculdade Hiperativo

Portal institucional completo para o **Colégio Faculdade Hiperativo** — educação integral do Ensino Fundamental ao Mestrado.

> **Slogan:** Educação que Transforma, Mentes que Brilham  
> **Tagline:** Do Ensino Fundamental ao Mestrado — Formação Integral para Toda a Vida

## 🚀 Tecnologias

- **HTML5** — Estrutura semântica (`html5/index.html`)
- **CSS3** — Design system completo (`css3/style.css`)
- **JavaScript / TypeScript** — Lógica e tipagem
- **React 18** — Componentes e SPA
- **React Router** — Navegação entre páginas
- **Vite** — Build tool e dev server

## 📁 Estrutura do Projeto

```
Projeto-ColegioHiperativo/
├── html5/
│   └── index.html              # Ponto de entrada HTML5
├── css3/
│   └── style.css               # Estilos globais e design system
├── public/
│   └── images/
│       ├── logo.svg            # Logomarca institucional
│       └── campus.svg          # Ilustração do campus
├── src/
│   ├── components/
│   │   ├── Header/             # Cabeçalho e navegação
│   │   ├── Footer/             # Rodapé institucional
│   │   └── Layout/             # Layout principal
│   ├── pages/
│   │   ├── HomePage.tsx        # Página inicial
│   │   ├── AboutPage.tsx       # Sobre a instituição
│   │   ├── CoursesPage.tsx     # Cursos (Fundamental ao Mestrado)
│   │   ├── SportsPage.tsx      # Esportes e atividades
│   │   ├── EnrollmentPage.tsx  # Formulário de matrícula completo
│   │   ├── LoginPage.tsx       # Login de usuários
│   │   ├── RegisterPage.tsx    # Cadastro de usuários
│   │   ├── ContactPage.tsx     # Fale conosco
│   │   └── NotFoundPage.tsx    # Página 404
│   ├── data/
│   │   └── constants.ts        # Dados institucionais e configurações
│   ├── types/
│   │   └── index.ts            # Tipos TypeScript
│   ├── utils/
│   │   └── validation.ts       # Validações e máscaras
│   ├── App.tsx                 # Rotas da aplicação
│   └── main.tsx                # Entry point React
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🏃 Como Executar

### Opção 1 — Atalho (Windows)
Clique duas vezes no arquivo **`iniciar-site.bat`** na pasta do projeto.  
O navegador abrirá automaticamente em `http://localhost:5173`.

### Opção 2 — Terminal
```bash
# Instalar dependências (apenas na primeira vez)
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

### Acessar o site

| Onde | Endereço |
|------|----------|
| **No seu PC** | http://localhost:5173 |
| **Celular / outro PC na mesma Wi-Fi** | http://192.168.15.7:5173 |

> **Importante:** Não abra o arquivo `dist/index.html` diretamente no navegador (duplo clique).  
> Sites React precisam de um servidor — use sempre `npm run dev` ou `iniciar-site.bat`.

### Build para produção
```bash
npm run build
npm run preview
```

## 📋 Funcionalidades

### Portal Institucional
- Página inicial com hero, estatísticas, features e preview de cursos
- Página "Sobre" com história, valores e timeline
- Catálogo completo de cursos (Fundamental, Médio, Técnico, Graduação, Especialização, Mestrado)
- Página de esportes (Natação, Karatê, Capoeira, Futebol Society, Vôlei, Basquete, Judô)
- Página de contato com formulário

### Formulário de Matrícula (Multi-step)
1. **Dados Pessoais** — Nome, CPF, RG, nascimento, gênero
2. **Contato & Endereço** — E-mail, telefone, WhatsApp, CEP com auto-preenchimento (ViaCEP)
3. **Dados Acadêmicos** — Nível, curso, turno, escola anterior
4. **Responsável** — Dados do responsável (para menores de 18 anos)
5. **Complementar** — Esportes, necessidades especiais, informações médicas
6. **Revisão** — Confirmação dos dados e aceite de termos (LGPD)

### Autenticação
- **Login** — E-mail, senha, lembrar-me, esqueci senha
- **Cadastro** — Tipo de usuário (Aluno, Responsável, Professor, Funcionário), validação de senha com indicador de força, CPF, telefone

### Identidade Visual
- Logomarca SVG (livro + raio de energia + letra H)
- Paleta: Azul (#1a56db) + Laranja (#f97316)
- Tipografia: Inter + Poppins
- Emojis representando perfis de alunos de todas as faixas etárias

## 🔜 Próximos Passos (Backend)

- [ ] API REST para cadastro e login de usuários
- [ ] Integração com banco de dados para matrículas
- [ ] Sistema de autenticação JWT
- [ ] Painel administrativo
- [ ] Área do aluno com notas, frequência e comunicados
- [ ] Upload de documentos na matrícula
- [ ] Integração com gateway de pagamento

## 📄 Licença

Projeto privado — Colégio Faculdade Hiperativo © 2026
