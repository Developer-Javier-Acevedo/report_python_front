import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ApiErrorResponse } from '../../shared/models/api.model';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      retry({ count: 1, delay: 1000 }),
      catchError((error: HttpErrorResponse) => {
        const apiError = this.buildApiError(error);
        console.error('[HttpErrorInterceptor] Error:', apiError);
        return throwError(() => apiError);
      })
    );
  }

  private buildApiError(error: HttpErrorResponse): ApiErrorResponse {
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      return {
        status: 0,
        message: 'Error de red. Verifica tu conexión a internet.',
        details: error.error.message
      };
    }

    // Server-side error
    switch (error.status) {
      case 400:
        return {
          status: 400,
          message: 'Solicitud incorrecta. Verifica los parámetros enviados.',
          details: this.extractErrorDetails(error)
        };
      case 401:
        return {
          status: 401,
          message: 'No autorizado. Verifica tus credenciales.',
          details: this.extractErrorDetails(error)
        };
      case 403:
        return {
          status: 403,
          message: 'Acceso denegado.',
          details: this.extractErrorDetails(error)
        };
      case 404:
        return {
          status: 404,
          message: 'Recurso no encontrado.',
          details: this.extractErrorDetails(error)
        };
      case 429:
        return {
          status: 429,
          message: 'Demasiadas solicitudes. Intenta de nuevo en unos momentos.',
          details: this.extractErrorDetails(error)
        };
      case 500:
        return {
          status: 500,
          message: 'Error interno del servidor. Intenta de nuevo más tarde.',
          details: this.extractErrorDetails(error)
        };
      case 502:
      case 503:
      case 504:
        return {
          status: error.status,
          message: 'Servicio no disponible temporalmente. Intenta más tarde.',
          details: this.extractErrorDetails(error)
        };
      default:
        return {
          status: error.status,
          message: `Error inesperado (${error.status}). Intenta de nuevo.`,
          details: this.extractErrorDetails(error)
        };
    }
  }

  private extractErrorDetails(error: HttpErrorResponse): string {
    if (error.error) {
      if (typeof error.error === 'string') {
        return error.error;
      }
      if (error.error.message) {
        return error.error.message;
      }
      if (error.error.reason) {
        return error.error.reason;
      }
    }
    return error.message || 'Sin detalles adicionales';
  }
}
