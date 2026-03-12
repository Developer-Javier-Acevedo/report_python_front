import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="app-shell">

      <!-- ===== HEADER ===== -->
      <header class="app-header">
        <div class="app-header__inner">

          <!-- Hamburger (solo mobile) -->
          <button
            class="hamburger"
            (click)="sidebarCollapsed = !sidebarCollapsed"
            type="button"
            aria-label="Toggle sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <!-- Logo / Brand -->
          <div class="app-header__brand">
            <div class="brand-logo">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M8.161 2.58a1.875 1.875 0 011.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0121.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 01-1.676 0l-4.994-2.497a.375.375 0 00-.336 0l-3.868 1.935A1.875 1.875 0 012.25 19.18V6.695c0-.710.401-1.36 1.036-1.677l4.875-2.437zM9 6a.75.75 0 01.75.75V15a.75.75 0 01-1.5 0V6.75A.75.75 0 019 6zm6.75 3a.75.75 0 00-1.5 0v8.25a.75.75 0 001.5 0V9z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="brand-text">
              <span class="brand-name">EjcRadar</span>
              <span class="brand-tagline">Análisis Geoespacial</span>
            </div>
          </div>

          <!-- Header right: estado de APIs -->
          <div class="app-header__right">
            <div class="status-indicator">
             
            </div>
            <div class="api-badges">
              
            </div>
          </div>

        </div>
      </header>

      <!-- ===== BODY: sidebar + contenido ===== -->
      <div class="app-body">

        <!-- Sidebar -->
        <app-sidebar
          [(collapsed)]="sidebarCollapsed"
        ></app-sidebar>

        <!-- Overlay móvil (cierra el sidebar al tocar fuera) -->
        <div
          class="sidebar-overlay"
          [class.sidebar-overlay--visible]="!sidebarCollapsed"
          (click)="sidebarCollapsed = true"
        ></div>

        <!-- Contenido principal -->
        <main
          class="app-main"
          [class.app-main--expanded]="sidebarCollapsed"
        >
          <router-outlet></router-outlet>
        </main>

      </div>

      <!-- ===== FOOTER ===== -->
      

    </div>
  `,
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent {
  currentYear = new Date().getFullYear();
  sidebarCollapsed = false;
}
