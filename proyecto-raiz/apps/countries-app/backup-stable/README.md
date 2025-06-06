# Explorador de Países

Una aplicación web moderna construida con Vue.js y Tailwind CSS que permite explorar información detallada sobre países, incluyendo clima en tiempo real, hora local, y más.

## Características

- 🌍 Información detallada de todos los países
- 🌤️ Clima en tiempo real
- 🕒 Hora local de cada país
- 📊 Múltiples vistas (Grid, Lista, Tabla)
- 🌓 Modo oscuro/claro
- 📱 Diseño responsive
- 💾 Sistema de favoritos
- 📊 Comparación de países
- 📤 Exportación a CSV

## Requisitos Previos

- Node.js (versión 14 o superior)
- npm o yarn

## Instalación

1. Clona el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd Vue-Tailwind-CountriesApp-master
```

2. Instala las dependencias:
```bash
npm install
# o si usas yarn:
yarn install
```

3. Crea un archivo `.env` en la raíz del proyecto con las siguientes claves API:
```env
VITE_OPENWEATHER_API_KEY=773ae8068b9eb518413aa1bf7ea495f1
VITE_TIMEZONE_API_KEY=QTYA3IOVBG1U
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
# o si usas yarn:
yarn dev
```

5. Abre tu navegador y visita `http://localhost:5173`

## Construcción para Producción

Para crear una versión optimizada para producción:

```bash
npm run build
# o si usas yarn:
yarn build
```

Los archivos generados estarán en el directorio `dist`.

## APIs Utilizadas

- [REST Countries API](https://restcountries.com/) - Información de países
- [OpenWeather API](https://openweathermap.org/api) - Datos del clima
- [TimezoneDB](https://timezonedb.com/) - Información de zonas horarias

## Notas Importantes

- Las claves API incluidas son para demostración. En un entorno de producción, deberías usar tus propias claves.
- La aplicación utiliza HTTP para las llamadas a la API del clima debido a limitaciones de la versión gratuita.
- Algunas características pueden requerir permisos de geolocalización del navegador.

## Solución de Problemas

Si encuentras algún problema con las APIs:

1. Verifica que las claves API estén correctamente configuradas en el archivo `.env`
2. Asegúrate de que tu navegador permita la geolocalización para características relacionadas con la ubicación
3. Verifica tu conexión a internet

## Créditos

Desarrollado con ❤️ usando:
- Vue.js 3
- Tailwind CSS
- Vite
- TypeScript
