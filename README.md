# SkillDrop

Ferramenta web **100% client-side** que converte arquivos `.skill` para `.zip` apenas trocando a extensão. Sem backend, sem upload, sem custo de infra.

## Como funciona

`.skill` é tecnicamente idêntico a `.zip`. O app lê o arquivo localmente via `FileReader`/`File.arrayBuffer()`, monta um novo `Blob` com os mesmos bytes e força o download via `URL.createObjectURL` + `<a download>`. Nenhum byte sai do dispositivo.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- `lucide-react` (única biblioteca de ícones — sem exceção)

## Rodando localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Scripts

| Comando            | O que faz                              |
| ------------------ | -------------------------------------- |
| `npm run dev`      | Servidor de desenvolvimento            |
| `npm run build`    | Build de produção                      |
| `npm start`        | Roda o build de produção               |
| `npm run typecheck`| Checagem de tipos via `tsc --noEmit`   |

## Comportamento

- **Drag-and-drop** ou clique para selecionar múltiplos `.skill`.
- Validação por arquivo:
  - Extensão `.skill` (case-insensitive) → caso contrário, rejeição visível.
  - Tamanho máximo de **500 MB** por arquivo → caso contrário, rejeição visível.
- **Deduplicação** de nome no download: se já existe `foo.zip` na fila, o próximo vira `foo (1).zip`, `foo (2).zip`...
- Botão **"Converter todos"** processa a fila sequencialmente.
- Botão de **download** por linha, ativado quando a conversão termina.
- Botão de **retry** por linha quando há erro.
- Botão **"Limpar tudo"** zera estado sem reload.

## Estrutura

```
src/
├── app/
│   ├── globals.css       — design tokens, scanlines, animações
│   ├── layout.tsx        — fonts (Archivo Black + JetBrains Mono)
│   └── page.tsx
├── components/
│   ├── SkillDropApp.tsx  — estado e orquestração
│   ├── DropZone.tsx      — drag-and-drop com corner-brackets
│   ├── FileRow.tsx       — linha individual da fila
│   └── StatusBadge.tsx   — pill [Aguardando] / [Convertendo] / [Pronto] / [Erro]
└── lib/
    ├── conversion.ts     — validação, dedupe, conversão, download
    └── types.ts
```

## Privacidade

Nenhum byte sai da sua máquina. Sem analytics, sem login, sem armazenamento remoto. O `.skill` original e o `.zip` resultante existem apenas na aba aberta do navegador.
