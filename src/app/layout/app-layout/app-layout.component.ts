import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <!-- Header -->
      <header class="app-header">
        <div class="app-header__inner">
          <!-- Logo -->
          <div class="app-header__brand">
            <div class="brand-logo">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M8.161 2.58a1.875 1.875 0 011.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0121.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 01-1.676 0l-4.994-2.497a.375.375 0 00-.336 0l-3.868 1.935A1.875 1.875 0 012.25 19.18V6.695c0-.710.401-1.36 1.036-1.677l4.875-2.437zM9 6a.75.75 0 01.75.75V15a.75.75 0 01-1.5 0V6.75A.75.75 0 019 6zm6.75 3a.75.75 0 00-1.5 0v8.25a.75.75 0 001.5 0V9z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="brand-text">
              <span class="brand-name">GeoRadar</span>
              <span class="brand-tagline">Análisis Geoespacial</span>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="app-nav">
            <a
              routerLink="/map"
              routerLinkActive="active"
              class="nav-link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.161 2.58a1.875 1.875 0 011.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0117.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 01-1.676 0l-4.994-2.497a.375.375 0 00-.336 0l-3.868 1.935A1.875 1.875 0 012.25 18.18V5.695c0-.710.401-1.36 1.036-1.677l4.875-2.437zM9 6a.75.75 0 01.75.75V15a.75.75 0 01-1.5 0V6.75A.75.75 0 019 6zm6.75 3a.75.75 0 00-1.5 0v8.25a.75.75 0 001.5 0V9z" clip-rule="evenodd" />
              </svg>
              Mapa
            </a>
          </nav>

          <!-- Header Right -->
          <div class="app-header__right">
            <div class="status-indicator">
              <span class="status-dot status-dot--online"></span>
              <span class="status-text">APIs activas</span>
            </div>
            <div class="api-badges">
              <span class="api-badge">Open-Meteo</span>
              <span class="api-badge">OSM</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="app-footer">
        <div class="app-footer__inner">
          <span class="footer-text">
            GeoRadar &copy; {{ currentYear }} &mdash; Datos meteorológicos por
            <a href="https://open-meteo.com" target="_blank" rel="noopener">Open-Meteo</a>
            &bull; Mapas por
            <a href="https://www.openstreetmap.org" target="_blank" rel="noopener">OpenStreetMap</a>
          </span>
          <div class="footer-tech">
            <span class="tech-badge">Angular 16</span>
            <span class="tech-badge">Leaflet</span>
            <span class="tech-badge">TypeScript</span>
          </div>
        </div>
      </footer>
    </div>
  `,
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent {
  currentYear = new Date().getFullYear();
}
