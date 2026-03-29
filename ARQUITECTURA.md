# 🚀 Jobs Scraper - Arquitectura Completa

## Componentes Implementados

### 1. **Backend - Scraping (Playwright)**
- **Archivo**: `src/lib/scraper-playwright.ts`
- **Características**:
  - Navega Bumeran.com.ar usando Playwright (headless Chrome)
  - Extrae automáticamente: título, empresa, ubicación, descripción, tipo de trabajo, salario
  - Busca múltiples términos: "node-js", "nest", "desarrollador-backend"
  - Filtrado automático por "remoto" + "argentina"

### 2. **Base de Datos (MongoDB con Mongoose)**
- **Archivo**: `src/lib/db.ts`
- **Fields por Job**:
  - `title`: string (requerido)
  - `company`: string (requerido)
  - `location`: string (ubicación)
  - `description`: string (descripción del puesto)
  - `source`: string (Bumeran, LinkedIn, etc)
  - `url`: string unique (link de la oferta)
  - `salary`: string (rango de salario)
  - `jobType`: string (full-time, part-time, remoto)
  - `createdAt`, `updatedAt`: timestamps automáticos

### 3. **API Endpoints**
- **GET `/api/jobs`** - Obtiene todas las ofertas de la BD
- **GET `/api/jobs?search=NODE`** - Busca ofertas por término
- **POST `/api/scrape`** - Dispara el scraping en tiempo real

### 4. **Frontend (React + Tailwind)**
- **JobCard**: Muestra ofertas con badges de ubicación, tipo, salario, fuente
- **JobGrid**: Grid con búsqueda en vivo y botón para scrapear

---

## 🚀 Cómo Usar

### Opción 1: Sin MongoDB (Development Local)
El servidor funciona sin base de datos. Los jobs se scrapean pero no se persisten.

```bash
npm run dev
# Servidor en http://localhost:3000
```

Haz clic en "🚀 Actualizar ofertas" para scrapear en vivo.

### Opción 2: Con MongoDB (Production)

#### A. MongoDB Atlas (Cloud - Recomendado)
1. Crea cuenta en https://www.mongodb.com/cloud/atlas
2. Crea un cluster gratuito (M0)
3. Obtén tu connection string: `mongodb+srv://user:pass@cluster.mongodb.net/jobs-scraper?retryWrites=true&w=majority`
4. Actualiza `.env.local`:
```env
MONGODB_URI=mongodb+srv://user:password@cluster0.mongodb.net/jobs-scraper?retryWrites=true&w=majority
```

#### B. MongoDB Local
1. Instala MongoDB: https://www.mongodb.com/try/download/community
2. Inicia el servicio:
```bash
mongod  # En Windows: Windows Services -> MongoDB
```
3. Por defecto conectará a `mongodb://localhost:27017/jobs-scraper`

### Iniciar y Scrapear
```bash
npm run dev
# El servidor estará en http://localhost:3000 o http://localhost:3001

# En el navegador:
# 1. Haz clic en "🚀 Actualizar ofertas"
# 2. Espera a que termine el scraping (15-30 segundos)
# 3. Verás las ofertas encontradas
# 4. Busca por término en la caja de búsqueda
```

---

## 📊 Arquitectura de Datos

```
Frontend (React)
      ↓
JobGrid.tsx (búsqueda + botón scrape)
      ↓
API Endpoints (/api/jobs, /api/scrape)
      ↓
Backend:
  - db.ts (Mongoose + MongoDB)
  - scraper-playwright.ts (Playwright)
      ↓
Bumeran.com.ar (target)
```

---

## 🔧 Configuración TypeScript

- **Target**: ES2020 (soporta iteración en Set/NodeList)
- **Strict Mode**: Habilitado
- **Path Aliases**: @/* → src/*

---

## 📝 Variables de Entorno

```env
# .env.local
MONGODB_URI=mongodb://localhost:27017/jobs-scraper
# O MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/jobs-scraper
```

---

## ⚡ Performance

- **Cache**: 1 hora (3600000ms)
- **Timeout**: 15s para búsqueda, 10s por oferta individual
- **Límite**: Procesa máximo 24 ofertas por búsqueda (8 × 3 búsquedas)
- **Concurrencia**: Evita scraping múltiple simultáneo

---

## 🛠️ Stack Completo

| Componente | Tecnología |
|-----------|-----------|
| Frontend | React 18 + TypeScript |
| CSS | Tailwind CSS v4 + styled-jsx |
| Backend | Next.js 16 API Routes |
| Scraping | Playwright (Chromium headless) |
| DB | MongoDB + Mongoose |
| Build | Turbopack |

---

## 📄 Flujo Completo

### 1. Usuario hace clic en "🚀 Actualizar ofertas"
```
Frontend → POST /api/scrape
```

### 2. Backend inicia scraping (Playwright)
```
Navegador → Bumeran.com.ar
  ↓
Extrae URLs de ofertas
  ↓
Itera cada URL
  ↓
Parse JavaScript-rendered content
  ↓
Salva en MongoDB (si disponible)
```

### 3. Frontend obtiene ofertas
```
GET /api/jobs
  ↓
Retorna JSON [{job1}, {job2}, ...]
  ↓
Renderiza en grid
```

### 4. Búsqueda en vivo
```
User tipea en search box
  ↓
GET /api/jobs?search=TERM
  ↓
MongoDB query con regex
  ↓
Resultados dinámicos
```

---

## ⚠️ Limitaciones Actuales

1. **Solo Bumeran**: LinkedIn requiere autenticación. Otros sitios requieren parsers específicos.
2. **Información limitada**: Algunos títulos/empresas pueden no extraerse si HTML cambia
3. **Sin autenticación**: El scraping es público, considera agregar API key si publicas
4. **Monolítico**: Scraping síncrono. Para producción usar job queue (Bull/RabbitMQ)

---

## 🚀 Próximos Pasos (Opcional)

- [ ] Agregar LinkedIn scraping (Playwright con login)
- [ ] Agregar Computrabajo.com.ar
- [ ] Agregar ZonaJobs
- [ ] Job queue para scraping en background (Bull)
- [ ] Autenticación de usuario
- [ ] Dashboard de estadísticas
- [ ] Notificaciones por email (Nodemailer)
- [ ] Deploy a Vercel/Railway con MongoDB Atlas

---

## 🐛 Troubleshoot

**Error: "MongoDB buffering timeout"**
→ No hay conexión a MongoDB. Sin MONGODB_URI configurado, ignora este error en desarrollo.

**Error: "Encontradas 0 ofertas"**
→ Puede ser:
  - Bumeran cambió su HTML/estructura
  - Las búsquedas no existen
  - Timeout en navegación
  - Solución: Verifica las URLs manualmente en el navegador

**Puerto 3000 en uso**
→ El servidor automáticamente usa puerto 3001, 3002, etc.

---

## 📞 Documentación de APIs

### GET /api/jobs
```bash
curl http://localhost:3000/api/jobs
# Response: { "jobs": [{...}, {...}] }
```

### GET /api/jobs?search=NODE
```bash
curl "http://localhost:3000/api/jobs?search=NODE"
# Busca en title, description, company
```

### POST /api/scrape
```bash
curl -X POST http://localhost:3000/api/scrape
# Inicia scraping, puede tardar 15-30 segundos
# Response: { "success": true, "jobsCount": 24 }
```

---

**¡Listo!** 🎉 Ahora tienes un scraper de empleos completo con arquitectura modular y base de datos.
