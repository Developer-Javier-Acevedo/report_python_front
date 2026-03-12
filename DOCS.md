# GeoRadar — Documentación Técnica Completa

> Frontend Angular 16 para análisis geoespacial con visualización de mapas y clima en tiempo real.

---

## Tabla de contenidos

1. [¿Qué hace este proyecto?](#1-qué-hace-este-proyecto)
2. [Cómo correrlo localmente](#2-cómo-correrlo-localmente)
3. [Estructura de carpetas explicada](#3-estructura-de-carpetas-explicada)
4. [Arquitectura: cómo fluyen los datos](#4-arquitectura-cómo-fluyen-los-datos)
5. [Modelos de datos](#5-modelos-de-datos)
6. [Servicios disponibles](#6-servicios-disponibles)
7. [Componentes existentes](#7-componentes-existentes)
8. [APIs externas usadas](#8-apis-externas-usadas)
9. [Cómo agregar nuevos componentes](#9-cómo-agregar-nuevos-componentes)
10. [Cómo agregar nuevas features](#10-cómo-agregar-nuevas-features)
11. [Cómo agregar nuevos servicios HTTP](#11-cómo-agregar-nuevos-servicios-http)
12. [Convenciones del proyecto](#12-convenciones-del-proyecto)
13. [Roadmap de funcionalidades futuras](#13-roadmap-de-funcionalidades-futuras)
14. [Preguntas frecuentes](#14-preguntas-frecuentes)

---

## 1. ¿Qué hace este proyecto?

GeoRadar es una aplicación web que permite:

- Ingresar coordenadas decimales (latitud / longitud) y un radio de acción
- Visualizar el punto en un mapa interactivo con marcador y círculo de radio
- Consultar las condiciones climáticas actuales del punto seleccionado (temperatura, viento, humedad)
- Ver un resumen de la consulta realizada

**Tecnologías principales:**

| Tecnología | Versión | Uso |
|---|---|---|
| Angular | 16.2 | Framework principal |
| TypeScript | 5.1 | Tipado estático |
| Leaflet | 1.9.4 | Mapa interactivo |
| RxJS | 7.8 | Programación reactiva |
| SCSS | — | Estilos |
| Open-Meteo API | — | Clima (gratis, sin API key) |
| OpenStreetMap | — | Tiles del mapa (gratis) |

---

## 2. Cómo correrlo localmente

### Requisitos previos

- Node.js 16.x o superior (recomendado: Node 20 LTS)
- npm 8+

### Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd report_python_front

# 2. Instalar dependencias
npm install

# 3. Correr en modo desarrollo
npm start
# → http://localhost:4200
```

### Otros comandos

```bash
npm run build          # Build de producción → genera /dist
npm run watch          # Build en modo watch (desarrollo)
npm test               # Correr tests unitarios
npx ng generate ...    # Generar componentes/servicios con Angular CLI
```

### Variables de entorno

Los endpoints de las APIs están en:

- **Desarrollo:** `src/environments/environment.ts`
- **Producción:** `src/environments/environment.prod.ts`

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  weatherApiUrl: 'https://api.open-meteo.com/v1',
  geocodingApiUrl: 'https://nominatim.openstreetmap.org'
};
```

Para agregar una nueva API, solo agrega la URL aquí y úsala desde `ApiConfigService`.

---

## 3. Estructura de carpetas explicada

```
src/
├── app/
│   │
│   ├── core/                        ← Capa de infraestructura (singleton)
│   │   ├── interceptors/            ← Interceptores HTTP globales
│   │   │   └── http-error.interceptor.ts
│   │   └── services/                ← Servicios de configuración global
│   │       └── api-config.service.ts
│   │
│   ├── shared/                      ← Todo lo reutilizable entre features
│   │   ├── components/              ← Componentes UI genéricos
│   │   │   ├── loading-spinner/
│   │   │   └── error-message/
│   │   └── models/                  ← Interfaces TypeScript del dominio
│   │       ├── coordinates.model.ts
│   │       ├── weather.model.ts
│   │       ├── map.model.ts
│   │       └── api.model.ts
│   │
│   ├── layout/                      ← Shell visual de la app
│   │   └── app-layout/              ← Header + router-outlet + footer
│   │
│   ├── features/                    ← Módulos funcionales de la app
│   │   └── geospatial/              ← Feature: análisis geoespacial
│   │       ├── components/          ← Componentes presentacionales
│   │       │   ├── coordinate-form/
│   │       │   ├── map-viewer/
│   │       │   ├── weather-panel/
│   │       │   └── location-summary/
│   │       ├── pages/               ← Componentes contenedor (páginas)
│   │       │   └── map-page/        ← Orquesta toda la feature
│   │       ├── services/            ← Lógica de negocio de la feature
│   │       │   ├── geospatial.service.ts
│   │       │   ├── weather.service.ts
│   │       │   └── map.service.ts
│   │       └── geospatial.routes.ts ← Rutas de esta feature
│   │
│   ├── app.component.ts             ← Componente raíz (mínimo)
│   ├── app.config.ts                ← Configuración global de Angular
│   └── app.routes.ts                ← Rutas principales (lazy loading)
│
├── environments/                    ← Config por entorno
│   ├── environment.ts
│   └── environment.prod.ts
│
└── styles/                          ← Estilos globales
    ├── _variables.scss              ← Design tokens (colores, tipografía)
    ├── _mixins.scss                 ← Helpers de SCSS
    ├── _reset.scss                  ← Reset CSS
    └── styles.scss                  ← Punto de entrada global
```

### Regla de oro de la estructura

```
¿Dónde va cada cosa?

¿Se usa en más de una feature?  → shared/
¿Es configuración o infraestructura? → core/
¿Es lógica específica de una feature? → features/<nombre>/services/
¿Es una pantalla completa? → features/<nombre>/pages/
¿Es un bloque visual sin estado propio? → features/<nombre>/components/
```

---

## 4. Arquitectura: cómo fluyen los datos

### Patrón: Contenedor → Presentacionales

```
MapPageComponent  (CONTENEDOR - tiene estado y lógica)
        │
        │ @Output: formSubmit(RadiusRequest)
        ├←── CoordinateFormComponent   (PRESENTACIONAL - solo UI y validación)
        │
        │ @Input: markerData, circleData
        ├──→ MapViewerComponent        (PRESENTACIONAL - renderiza el mapa)
        │
        │ @Input: weather, loading, error
        ├──→ WeatherPanelComponent     (PRESENTACIONAL - muestra el clima)
        │
        │ @Input: query
        └──→ LocationSummaryComponent  (PRESENTACIONAL - muestra el resumen)
```

**Regla:** Los componentes presentacionales **nunca** inyectan servicios HTTP.
Solo reciben datos via `@Input` y emiten eventos via `@Output`.

### Flujo completo de una consulta

```
1. Usuario llena el formulario
       ↓
2. CoordinateFormComponent valida con Reactive Forms
       ↓ emite @Output formSubmit(RadiusRequest)
3. MapPageComponent.onFormSubmit() recibe el evento
       ↓
4. GeospatialService.validateCoordinates()  → validación extra
   GeospatialService.convertRadiusConfig()  → convierte a metros
       ↓
5. Actualiza markerData y circleData        → MapViewerComponent reacciona (ngOnChanges)
       ↓
6. WeatherService.getWeather(coordinates)   → llama Open-Meteo API
       ↓ Observable<WeatherResponse>
7. next: weatherData → WeatherPanelComponent via @Input
   error: message    → ErrorMessageComponent via @Input
```

---

## 5. Modelos de datos

Ubicados en `src/app/shared/models/`. **Nunca pongas lógica aquí, solo interfaces.**

### coordinates.model.ts

```typescript
Coordinates        → { latitude: number, longitude: number }
RadiusConfig       → { value: number, unit: 'meters' | 'kilometers' }
LocationQuery      → { coordinates, radius, timestamp, label? }
RadiusRequest      → { coordinates, radius }  // lo que emite el formulario
```

### weather.model.ts

```typescript
WeatherResponse    → estructura interna normalizada del clima
OpenMeteoResponse  → respuesta cruda de la API Open-Meteo
WEATHER_CODE_MAP   → diccionario: código numérico → { description, icon, main }
```

### map.model.ts

```typescript
MapMarkerData      → { coordinates, title, popupContent? }
MapCircleData      → { coordinates, radiusMeters, color?, fillColor?, fillOpacity? }
MapViewState       → { center: Coordinates, zoom: number }
```

### api.model.ts

```typescript
ApiErrorResponse   → { status, message, details? }
LoadingState       → 'idle' | 'loading' | 'success' | 'error'
```

---

## 6. Servicios disponibles

### GeospatialService
**Ubicación:** `features/geospatial/services/geospatial.service.ts`
**Tipo:** Utilidades puras (sin HTTP)

| Método | Qué hace |
|---|---|
| `validateCoordinates(lat, lon)` | Valida que las coords estén en rango válido |
| `convertRadiusConfig(radius)` | Convierte RadiusConfig a metros (número) |
| `formatCoordinates(coords)` | Formatea a string legible: "40.4168°N, 3.7038°W" |
| `formatRadius(radius)` | Formatea a string: "500 m" o "2 km" |
| `calculateBounds(coords, radiusMeters)` | Calcula bounding box para fitBounds |

### WeatherService
**Ubicación:** `features/geospatial/services/weather.service.ts`
**Tipo:** HTTP — consume Open-Meteo API

| Método | Qué hace |
|---|---|
| `getWeather(coordinates)` | Retorna `Observable<WeatherResponse>` |
| `getWindDirectionLabel(degrees)` | Convierte grados a "N", "NE", "SSO", etc. |

### MapService
**Ubicación:** `features/geospatial/services/map.service.ts`
**Tipo:** Encapsula toda la lógica de Leaflet

| Método | Qué hace |
|---|---|
| `initMap(container, center, zoom)` | Inicializa el mapa en el elemento HTML dado |
| `setMarker(data)` | Coloca/actualiza el marcador en el mapa |
| `setCircle(data)` | Dibuja/actualiza el círculo de radio |
| `flyTo(coordinates, zoom)` | Animación de vuelo a coordenadas |
| `fitCircleBounds(coords, radius)` | Ajusta el zoom para mostrar el círculo completo |
| `clearLayers()` | Elimina marcador y círculo |
| `destroyMap()` | Destruye el mapa y libera memoria |
| `invalidateSize()` | Recalcula tamaño (usar si el contenedor cambia de tamaño) |

### ApiConfigService
**Ubicación:** `core/services/api-config.service.ts`
**Tipo:** Configuración — lee de `environment.ts`

Centraliza todas las URLs. Si un endpoint cambia, solo se cambia aquí.

---

## 7. Componentes existentes

### Componentes presentacionales (reciben @Input, emiten @Output)

| Componente | Ubicación | Propósito |
|---|---|---|
| `CoordinateFormComponent` | `features/geospatial/components/coordinate-form/` | Formulario reactivo con validaciones |
| `MapViewerComponent` | `features/geospatial/components/map-viewer/` | Renderiza mapa Leaflet |
| `WeatherPanelComponent` | `features/geospatial/components/weather-panel/` | Muestra datos del clima |
| `LocationSummaryComponent` | `features/geospatial/components/location-summary/` | Resumen de la consulta |
| `LoadingSpinnerComponent` | `shared/components/loading-spinner/` | Spinner reutilizable |
| `ErrorMessageComponent` | `shared/components/error-message/` | Mensaje de error reutilizable |

### Componentes contenedor (tienen estado y coordinan servicios)

| Componente | Ubicación | Propósito |
|---|---|---|
| `MapPageComponent` | `features/geospatial/pages/map-page/` | Orquesta la feature geoespacial |
| `AppLayoutComponent` | `layout/app-layout/` | Shell: header + router-outlet |

---

## 8. APIs externas usadas

### Open-Meteo (clima)
- **URL:** `https://api.open-meteo.com/v1/forecast`
- **Costo:** Gratis, sin API key
- **Docs:** https://open-meteo.com/en/docs
- **Parámetros usados:** `latitude`, `longitude`, `current_weather=true`, `hourly=relativehumidity_2m`

### OpenStreetMap (tiles del mapa)
- **URL:** `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Costo:** Gratis
- **Límite:** No bombardear el servidor (uso normal está bien)

### Nominatim (geocodificación — configurado, pendiente de implementar)
- **URL:** `https://nominatim.openstreetmap.org`
- **Costo:** Gratis
- **Uso futuro:** Buscar lugares por nombre y obtener sus coordenadas

---

## 9. Cómo agregar nuevos componentes

### Caso A: Componente presentacional dentro de una feature existente

**Ejemplo:** Agregar un `ElevationPanelComponent` a la feature geospatial.

**Paso 1 — Crear los archivos:**
```
src/app/features/geospatial/components/elevation-panel/
├── elevation-panel.component.ts
└── elevation-panel.component.scss
```

**Paso 2 — Estructura del componente (siempre standalone):**
```typescript
// elevation-panel.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-elevation-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="elevation-panel" *ngIf="elevation !== null">
      <h3>Elevación</h3>
      <p>{{ elevation }} metros sobre el nivel del mar</p>
    </div>
  `,
  styleUrls: ['./elevation-panel.component.scss']
})
export class ElevationPanelComponent {
  @Input() elevation: number | null = null;
}
```

**Paso 3 — Importarlo en la página contenedora:**
```typescript
// map-page.component.ts
import { ElevationPanelComponent } from '../../components/elevation-panel/elevation-panel.component';

@Component({
  imports: [
    // ... otros imports
    ElevationPanelComponent   // ← agregar aquí
  ],
  template: `
    <!-- agregar en el template donde corresponda -->
    <app-elevation-panel [elevation]="elevationData"></app-elevation-panel>
  `
})
export class MapPageComponent {
  elevationData: number | null = null;
  // ... resto de la lógica
}
```

**Eso es todo.** No hay NgModule que actualizar.

---

### Caso B: Componente reutilizable (shared)

**Ejemplo:** Un badge de estado que se usa en varias features.

```
src/app/shared/components/status-badge/
├── status-badge.component.ts
└── status-badge.component.scss
```

```typescript
// status-badge.component.ts
@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge badge--{{ type }}">{{ text }}</span>`,
  styleUrls: ['./status-badge.component.scss']
})
export class StatusBadgeComponent {
  @Input() text = '';
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
}
```

Luego se importa en cualquier componente que lo necesite, igual que el caso A.

---

## 10. Cómo agregar nuevas features

Una "feature" es un módulo funcional completo (ej: historial, exportación, puntos de interés).

### Estructura a crear

```
src/app/features/<nombre-feature>/
├── components/          ← Componentes presentacionales de esta feature
├── pages/               ← Páginas (contenedores) de esta feature
│   └── <nombre>-page/
│       ├── <nombre>-page.component.ts
│       └── <nombre>-page.component.scss
├── services/            ← Servicios propios de esta feature
└── <nombre>.routes.ts   ← Rutas de esta feature
```

### Paso a paso: agregar feature "Historial"

**1. Crear la ruta de la feature:**
```typescript
// src/app/features/history/history.routes.ts
import { Routes } from '@angular/router';
import { HistoryPageComponent } from './pages/history-page/history-page.component';

export const HISTORY_ROUTES: Routes = [
  { path: '', component: HistoryPageComponent }
];
```

**2. Registrar con lazy loading en app.routes.ts:**
```typescript
// src/app/app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: 'map', pathMatch: 'full' },
  {
    path: 'map',
    loadChildren: () => import('./features/geospatial/geospatial.routes')
      .then(m => m.GEOSPATIAL_ROUTES)
  },
  {
    path: 'history',                   // ← nueva ruta
    loadChildren: () => import('./features/history/history.routes')
      .then(m => m.HISTORY_ROUTES)
  },
  { path: '**', redirectTo: 'map' }
];
```

**3. Agregar el link en el layout:**
```typescript
// src/app/layout/app-layout/app-layout.component.ts
// Agregar en el template del nav:
// <a routerLink="/history" routerLinkActive="active">Historial</a>
```

**4. Crear la página y los componentes de la feature normalmente.**

La feature se carga en memoria **solo cuando el usuario navega a ella** (lazy loading automático).

---

## 11. Cómo agregar nuevos servicios HTTP

### Servicio dentro de una feature

**Ejemplo:** `ElevationService` que consulta Open-Topo-Data API.

**Paso 1 — Agregar la URL al environment:**
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  weatherApiUrl: 'https://api.open-meteo.com/v1',
  geocodingApiUrl: 'https://nominatim.openstreetmap.org',
  elevationApiUrl: 'https://api.open-elevation.com/api/v1'  // ← nuevo
};
```

**Paso 2 — Exponer la URL en ApiConfigService:**
```typescript
// src/app/core/services/api-config.service.ts
@Injectable({ providedIn: 'root' })
export class ApiConfigService {
  readonly elevationApiUrl = environment.elevationApiUrl;  // ← agregar
}
```

**Paso 3 — Crear el servicio:**
```typescript
// src/app/features/geospatial/services/elevation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiConfigService } from '../../../core/services/api-config.service';
import { Coordinates } from '../../../shared/models/coordinates.model';

export interface ElevationResult {
  elevation: number;
  latitude: number;
  longitude: number;
}

@Injectable({ providedIn: 'root' })
export class ElevationService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}

  getElevation(coordinates: Coordinates): Observable<ElevationResult> {
    const url = `${this.apiConfig.elevationApiUrl}/lookup?locations=${coordinates.latitude},${coordinates.longitude}`;

    return this.http.get<any>(url).pipe(
      map(response => ({
        elevation: response.results[0].elevation,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      })),
      catchError(error => throwError(() => error))
    );
  }
}
```

**Paso 4 — Inyectar en la página contenedora:**
```typescript
// map-page.component.ts
constructor(
  private geoService: GeospatialService,
  private weatherService: WeatherService,
  private elevationService: ElevationService  // ← inyectar
) {}
```

---

## 12. Convenciones del proyecto

### Nombrado de archivos
```
componente:   kebab-case.component.ts / .scss
servicio:     kebab-case.service.ts
modelo:       kebab-case.model.ts
rutas:        kebab-case.routes.ts
interceptor:  kebab-case.interceptor.ts
```

### Nombrado de clases
```typescript
ComponentesPresentacionales → NombreComponent   (sin lógica de negocio)
PáginasContenedoras         → NombrePageComponent
Servicios                   → NombreService
Interfaces/modelos          → NombreInterface o solo Nombre (sin I prefix)
```

### Imports en componentes standalone
```typescript
// Orden recomendado en el array imports:
imports: [
  // 1. Módulos de Angular
  CommonModule,
  ReactiveFormsModule,
  RouterModule,
  // 2. Componentes propios (shared primero, luego feature)
  LoadingSpinnerComponent,
  ErrorMessageComponent,
  CoordinateFormComponent,
]
```

### Estilos
- Todos los colores y medidas vienen de `src/styles/_variables.scss`
- Nunca usar valores hardcodeados de color en componentes (usar `$primary`, `$danger`, etc.)
- Cada componente tiene su propio `.scss` — evitar estilos globales salvo en `styles.scss`
- Clases CSS siguen convención BEM: `.card__title`, `.card--highlighted`

### Principios que mantienen el proyecto sano
- **Un servicio = una responsabilidad.** `WeatherService` solo hace clima, no toca el mapa.
- **Componentes presentacionales = sin servicios HTTP.** Solo `@Input` / `@Output`.
- **Modelos = solo interfaces.** Sin lógica, sin métodos.
- **Lazy loading en todas las features.** Nunca importar una feature directamente en `AppComponent`.

---

## 13. Roadmap de funcionalidades futuras

Lista de features planeadas y cómo encajarían en la arquitectura:

### Historial de consultas
```
Qué: guardar las últimas N consultas del usuario
Dónde: nueva feature features/history/
Servicio: HistoryService → usa localStorage, sin HTTP
Modelo: agregar HistoryEntry a shared/models/
```

### Exportar vista a PDF
```
Qué: descargar el mapa + resumen como PDF
Dónde: shared/services/export.service.ts (es reutilizable)
Librería: jsPDF + html2canvas
Trigger: botón en LocationSummaryComponent → @Output → MapPageComponent → ExportService
```

### Puntos de interés cercanos (POI)
```
Qué: mostrar hospitales, farmacias, etc. dentro del radio
Dónde: nueva feature features/poi/ o nuevo servicio en geospatial
API: Overpass API (OpenStreetMap, gratis)
Servicio: PoiService → getPointsOfInterest(coords, radiusMeters, category)
Mapa: nuevo método en MapService → addPOILayer(points)
```

### Elevación del terreno
```
Qué: mostrar altitud del punto seleccionado
Dónde: nuevo componente components/elevation-panel/ en geospatial
API: Open-Elevation API (gratis) o Open-Meteo (tiene elevation param)
Servicio: ElevationService → getElevation(coords)
```

### Búsqueda por nombre de lugar
```
Qué: escribir "Madrid" y que llene las coordenadas automáticamente
Dónde: nuevo componente components/place-search/ en geospatial
API: Nominatim (ya está configurada en environment)
Servicio: GeocodingService (ya está en ApiConfigService, falta el servicio)
```

### Modo oscuro / claro
```
Qué: toggle de tema
Dónde: core/services/theme.service.ts
Implementación: CSS custom properties en :root, ThemeService cambia clase en <body>
```

---

## 14. Preguntas frecuentes

**¿Dónde pongo la lógica de un nuevo botón?**
Si el botón pertenece a un componente presentacional → método local en ese componente + `@Output`.
Si el botón dispara lógica de negocio → el evento llega al contenedor (`MapPageComponent`) y este llama al servicio.

**¿Puedo inyectar `HttpClient` directamente en un componente?**
Técnicamente sí, pero **no lo hagas**. Siempre crea un servicio. Así el componente se puede testear sin red.

**¿Cómo agrego un nuevo tile de mapa (ej: satélite)?**
Modifica `MapService.initMap()` o agrega un método `setTileLayer(type: 'street' | 'satellite')`. Las URLs de tiles están en la documentación de Leaflet Providers.

**¿Cómo cambio los colores de la app?**
Solo modifica `src/styles/_variables.scss`. Los cambios se propagan a todos los componentes.

**¿Cómo testeo un servicio?**
```typescript
// ejemplo: weather.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WeatherService } from './weather.service';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(WeatherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch weather', () => {
    service.getWeather({ latitude: 40.4, longitude: -3.7 }).subscribe(data => {
      expect(data).toBeTruthy();
    });
    const req = httpMock.expectOne(r => r.url.includes('open-meteo'));
    req.flush({ current_weather: { temperature: 20, windspeed: 10, weathercode: 1, time: '2024-01-01T12:00', winddirection: 180 } });
  });
});
```

**¿Qué pasa si la API de clima falla?**
El interceptor `http-error.interceptor.ts` captura el error, lo convierte a `ApiErrorResponse` con mensaje en español, y lo propaga por el Observable. `MapPageComponent` lo captura en el bloque `error:` del `subscribe` y lo muestra via `ErrorMessageComponent`.

---

*Documentación generada para GeoRadar v0.1 — Angular 16 + Leaflet + Open-Meteo*
