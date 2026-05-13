<div align="center">

# 📦 SkillDrop

![Next.js](https://img.shields.io/badge/Next.js-^16.2.6-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-^19.2.6-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-^5.7.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-^4.0.0-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-111111?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjoaogabrieldev%2Fprojeto-skilldrop)
[![GitHub](https://img.shields.io/badge/GitHub-joaogabrieldev-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/joaogabrieldev/projeto-skilldrop)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-joaogabrielrocha-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/joaogabrielrocha)

Ferramenta web **100% client-side** que converte arquivos `.skill` em `.zip` no próprio navegador — sem backend, sem upload e sem custo de infraestrutura.

</div>

---

## 📑 Índice

- [🌐 Deploy](#-deploy)
- [📖 Sobre](#-sobre)
- [🧱 Padrões e Fundamentos](#-padrões-e-fundamentos)
- [🛠️ Tecnologias e Bibliotecas](#️-tecnologias-e-bibliotecas)
- [🗂️ Estrutura do Projeto](#️-estrutura-do-projeto)
- [⚙️ Como rodar localmente](#️-como-rodar-localmente)
- [📌 Evento](#-evento)
- [👨‍💻 Contato](#-contato)

---

## 🌐 Deploy

Publicação na **Vercel**

### 🔗 [Demonstração ao vivo](https://projeto-skilldrop.vercel.app/)

---

## 📖 Sobre

O **SkillDrop** é uma aplicação Next.js que trata `.skill` como arquivo ZIP: o conteúdo é lido localmente (`FileReader` / `File.arrayBuffer()`), processado com **JSZip** (incluindo remoção de uma pasta raiz redundante quando todos os itens do zip estão sob um único diretório), gera um novo blob `.zip` e dispara o download com `URL.createObjectURL` e um elemento `<a download>`. **Nenhum byte sai do dispositivo.**

O que você pode fazer com o app:

- **Arrastar e soltar** ou clicar para selecionar vários arquivos `.skill`;
- **Validação** por arquivo: extensão `.skill` (case-insensitive) e tamanho máximo de **500 MB** por arquivo, com feedback visual em caso de rejeição;
- **Deduplicação** de nomes no download (`foo.zip`, `foo (1).zip`, …);
- **Converter todos** em sequência, **download** por item quando pronto, **retry** em caso de erro e **Limpar tudo** sem recarregar a página;
- **Privacidade:** sem analytics, login ou armazenamento remoto — apenas a aba do navegador.

---

## 🧱 Padrões e Fundamentos

O projeto segue fundamentos importantes de arquitetura:

- **Execução exclusivamente no cliente** (sem API própria, upload ou telemetria);
- **Next.js App Router** com componentes React pequenos e responsabilidades claras (`SkillDropApp`, `DropZone`, `FileRow`, etc.);
- **Estilização com Tailwind CSS v4** e tokens visuais centralizados em `globals.css`;
- **Conversão e reempacotamento com JSZip**, com lógica de validação, nomes de download e detecção de pasta raiz isolada em `lib/conversion.ts`;
- **Padronização de código** com ESLint via `next lint` e checagem de tipos com `tsc --noEmit`.

---

## 🛠️ Tecnologias e Bibliotecas

<div align="center">
  <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,pnpm,github" alt="Stack principal" />
</div>

### 🚀 Stack principal

- **Next.js** (`^16.2.6`)
- **React** (`^19.2.6`)
- **TypeScript** (`^5.7.0`)
- **Tailwind CSS** (`^4.0.0`)

### 📚 Bibliotecas utilizadas

- **Interface e ícones**: `lucide-react`
- **Arquivos e ZIP**: `jszip`

### 🧪 Dev tooling

- `@tailwindcss/postcss`, `postcss`, `tailwindcss`
- `@types/node`, `@types/react`, `@types/react-dom`

### 🧩 Ícones das stacks

<div align="center">

<img height="48" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" alt="Next.js" />
&nbsp;
<img height="48" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React" />
&nbsp;
<img height="48" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" alt="TypeScript" />
&nbsp;
<img height="48" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" alt="Tailwind CSS" />

</div>

---

## 🗂️ Estrutura do Projeto

```bash
projeto-skilldrop/
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── tsconfig.json
└── src/
    ├── app/
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── DropZone.tsx
    │   ├── FileRow.tsx
    │   ├── SkillDropApp.tsx
    │   └── StatusBadge.tsx
    └── lib/
        ├── conversion.ts
        └── types.ts
```

---

## ⚙️ Como rodar localmente

### Pré-requisitos

- Node.js 18+
- **pnpm** (recomendado — há `pnpm-lock.yaml` no repositório) ou `npm`

### Passos

```bash
git clone https://github.com/joaogabrieldev/projeto-skilldrop.git
cd projeto-skilldrop
pnpm install
pnpm dev
```

Aplicação local: `http://localhost:3000`

### Scripts úteis

- `pnpm dev` → servidor de desenvolvimento
- `pnpm build` → build de produção
- `pnpm start` → executa o build de produção
- `pnpm run lint` → `next lint`
- `pnpm run typecheck` → `tsc --noEmit`

---

## 📌 Evento

**Evento/curso relacionado:** `não informado no repositório`

---

## 👨‍💻 Contato

<div align="center">

### João Gabriel R. Rocha

[![GitHub](https://img.shields.io/badge/GitHub-joaogabrieldev-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/joaogabrieldev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-joaogabrielrocha-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/joaogabrielrocha)
[![Portfólio](https://img.shields.io/badge/Site-joaogabriel.dev-0A0A0A?style=for-the-badge&logo=googlechrome&logoColor=white)](https://joaogabriel.dev)

</div>

---

<div align="center">

Feito com ❤️, Next.js e muito café.

</div>
