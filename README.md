# Netatmo Weather App

Aplicación web para visualizar datos de tu estación meteorológica Netatmo.

## Características

- 🌡️ Temperatura actual del módulo exterior
- 📊 Mínimas y máximas del día
- 📅 Histórico de temperaturas por día
- 📈 Gráficos interactivos

## Configuración

### 1. Configurar Redirect URI en Netatmo

1. Ve a https://dev.netatmo.com/apps/
2. Edita tu aplicación
3. En **Redirect URI** añade: `https://tu-dominio.vercel.app/callback`
4. Guarda los cambios

### 2. Desplegar en Vercel

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Desplegar
cd /Users/paoloac/Desktop/Netatmoapp
vercel
```

Sigue las instrucciones:
- ¿Setup and deploy? → **Yes**
- ¿Which scope? → Tu cuenta
- ¿Link to existing project? → **No**
- ¿Project name? → **netatmo-weather-app**
- ¿In which directory? → **./** (dejar por defecto)
- ¿Override settings? → **No**

### 3. Actualizar Redirect URI con tu dominio real

Una vez desplegado, Vercel te dará una URL como `https://netatmo-weather-app-xxx.vercel.app`

Vuelve a https://dev.netatmo.com/apps/ y actualiza la Redirect URI con tu URL real:
- `https://netatmo-weather-app-xxx.vercel.app/callback`

## Uso local (desarrollo)

Para probar localmente necesitarás un servidor local. No funcionará abriendo el HTML directamente.

```bash
# Opción 1: Python
python3 -m http.server 8000

# Opción 2: Node.js
npx http-server

# Luego abre: http://localhost:8000
```

**Nota:** El login OAuth no funcionará en local, solo en Vercel/producción.

## Estructura

```
Netatmoapp/
├── index.html          # Página principal
├── callback.html       # Callback OAuth
├── app.js             # Lógica JavaScript
├── api/
│   └── token.js       # Serverless function para tokens
├── vercel.json        # Configuración de Vercel
└── README.md          # Este archivo
```

## Seguridad

⚠️ **IMPORTANTE:** Nunca subas las credenciales `CLIENT_SECRET` al frontend. Están solo en el archivo `api/token.js` que se ejecuta en el servidor de Vercel.
