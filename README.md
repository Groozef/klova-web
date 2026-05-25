# klova-web

Web frontend for **Klova** — маркетплейс самозанятых СНГ с эскроу-защитой и налоговым помощником.

Talks to [`klova-api`](https://github.com/Groozef/klova-api) over REST.

Status: **MVP** — функциональный фронт под весь backend flow (auth → orders → deals → tax), без всех артбордов и полной полировки.

## Stack

- **Next.js 16** (App Router) + React 19
- **TypeScript** strict
- **Tailwind CSS 4** с design-tokens из брендбука (`@theme inline`)
- **SWR** для data fetching
- **next/font** — Manrope + JetBrains Mono
- Auth: JWT access (in-memory) + refresh (localStorage), автоматический rotation на 401

## Pages

| Path | Auth | Purpose |
|---|---|---|
| `/` | public | Landing с hero и принципами |
| `/auth/signup` | public | Регистрация (email/password + Google OAuth) |
| `/auth/signin` | public | Вход |
| `/feed` | jwt | Рекомендованные заказы по специализациям |
| `/orders` | jwt | Каталог заказов + фильтр по категории |
| `/orders/new` | jwt | Создать заказ |
| `/orders/[id]` | jwt | Детали заказа + отклики + accept |
| `/deals` | jwt | Список сделок |
| `/deals/[id]` | jwt | Lifecycle сделки + транзакции + tax |
| `/notifications` | jwt | Inbox с пометкой прочитанным |
| `/chats` | jwt | Список чатов |
| `/tax` | jwt | Сводка и история налоговых начислений |
| `/profile/me` | jwt | Свой профиль + редактирование |

## Getting started

### Prerequisites

- Node.js 22+
- `klova-api` запущен (по умолчанию `http://localhost:3000`)

### Setup

```bash
npm install
cp .env.example .env.local
# отредактируй NEXT_PUBLIC_API_URL если бэк на другом порту
npm run dev
```

Открой http://localhost:3001 (или другой порт если 3000 занят бэком).

> Запускай на порту **отличном от бэка** — Next по умолчанию возьмёт 3001 если 3000 занят, или укажи `next dev -p 3001`.

## Environment variables

| Var | Required | Default | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes | `http://localhost:3000/api` | URL бэка klova-api |

## Project structure

```
src/
├── app/
│   ├── (app)/               protected route group with AppNav + auth gate
│   │   ├── feed/            рекомендованные заказы
│   │   ├── orders/          каталог + создание + детали
│   │   ├── deals/           сделки + lifecycle
│   │   ├── chats/           threads list
│   │   ├── notifications/   inbox
│   │   ├── tax/             сводка налогов
│   │   ├── profile/me/      свой профиль
│   │   └── layout.tsx       auth guard, top nav
│   ├── auth/
│   │   ├── signup/page.tsx
│   │   ├── signin/page.tsx
│   │   └── layout.tsx       чистый layout без nav
│   ├── layout.tsx           root: html, fonts, AuthProvider
│   ├── globals.css          design tokens + Tailwind theme
│   └── page.tsx             landing
├── components/
│   ├── layout/app-nav.tsx
│   └── ui/                  Button, Input, Textarea, Logo
└── lib/
    ├── api/
    │   ├── client.ts        fetch wrapper + auto refresh on 401
    │   ├── hooks.ts         SWR hooks по всем endpoints
    │   └── types.ts         mirror enums/DTO от klova-api
    └── auth/
        └── auth-context.tsx React Context: signin/signup/logout/refresh
```

## Что не сделано (на следующую сессию)

- Полная pixel-perfect реализация всех артбордов из `DesignAppWebMobile/`
- Public profile (`/profile/[id]`) с публичным портфолио
- Posts CRUD (создание постов в ленте, лайки)
- Realtime сообщений (WebSocket вместо polling)
- Загрузка медиа (S3/Backblaze) для аватаров и портфолио
- PWA конфиг (manifest, service worker)
- Mobile responsive шлифовка
- Skeleton loaders вместо «Загружаю…»
- Toast notifications для action feedback

## Scripts

```bash
npm run dev    # dev server, hot reload
npm run build  # production build
npm run start  # serve built app
npm run lint   # eslint
```

## Deploy

- **Vercel** — самый простой путь, подключается к GitHub
- **Railway / Fly.io** — если хочется единого хостинга с API
