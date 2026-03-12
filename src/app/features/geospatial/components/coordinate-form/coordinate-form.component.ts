import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { RadiusRequest } from '../../../../shared/models/coordinates.model';

@Component({
  selector: 'app-coordinate-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-card">
      <div class="form-header">
        <div class="form-header__icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.328a8 8 0 10-16 0c0 3.631 1.557 6.326 3.5 8.328a19.579 19.579 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
          </svg>
        </div>
        <div>
          <h2 class="form-header__title">Búsqueda Geoespacial</h2>
          <p class="form-header__subtitle">Introduce coordenadas y radio</p>
        </div>
      </div>

      <form [formGroup]="coordForm" (ngSubmit)="onSubmit()" novalidate>

        <!-- Latitude Field -->
        <div class="form-group">
          <label class="form-label" for="latitude">
            <span class="form-label__text">Latitud</span>
            <span class="form-label__range">-90° a 90°</span>
          </label>
          <div class="input-wrapper">
            <span class="input-prefix">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 1a.75.75 0 01.75.75v1.5h3.75a.75.75 0 010 1.5h-3.75V10h3.75a.75.75 0 010 1.5h-3.75v5.25a.75.75 0 01-1.5 0V11.5H5.5a.75.75 0 010-1.5h3.75V4.75H5.5a.75.75 0 010-1.5h3.75V1.75A.75.75 0 0110 1z" clip-rule="evenodd" />
              </svg>
            </span>
            <input
              id="latitude"
              type="number"
              formControlName="latitude"
              placeholder="Ej: 40.4168"
              step="0.000001"
              [class.is-invalid]="isFieldInvalid('latitude')"
              [class.is-valid]="isFieldValid('latitude')"
            />
          </div>
          <div class="field-errors" *ngIf="isFieldInvalid('latitude')">
            <span *ngIf="getFieldError('latitude', 'required')" class="error-text">La latitud es obligatoria</span>
            <span *ngIf="getFieldError('latitude', 'min')" class="error-text">La latitud mínima es -90°</span>
            <span *ngIf="getFieldError('latitude', 'max')" class="error-text">La latitud máxima es 90°</span>
          </div>
          <div class="field-hint" *ngIf="!isFieldInvalid('latitude') && coordForm.get('latitude')?.value">
            {{ getLatitudeHint() }}
          </div>
        </div>

        <!-- Longitude Field -->
        <div class="form-group">
          <label class="form-label" for="longitude">
            <span class="form-label__text">Longitud</span>
            <span class="form-label__range">-180° a 180°</span>
          </label>
          <div class="input-wrapper">
            <span class="input-prefix">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 1a9 9 0 100 18A9 9 0 0010 1zm-.75 14.93V15.5a.75.75 0 011.5 0v.43A7.5 7.5 0 0117.5 10H17a.75.75 0 010-1.5h.5a7.5 7.5 0 01-6.75-7.43V1.5a.75.75 0 00-1.5 0v-.43A7.5 7.5 0 012.5 8.5H3a.75.75 0 010 1.5h-.5a7.5 7.5 0 016.75 6.43z" />
              </svg>
            </span>
            <input
              id="longitude"
              type="number"
              formControlName="longitude"
              placeholder="Ej: -3.7038"
              step="0.000001"
              [class.is-invalid]="isFieldInvalid('longitude')"
              [class.is-valid]="isFieldValid('longitude')"
            />
          </div>
          <div class="field-errors" *ngIf="isFieldInvalid('longitude')">
            <span *ngIf="getFieldError('longitude', 'required')" class="error-text">La longitud es obligatoria</span>
            <span *ngIf="getFieldError('longitude', 'min')" class="error-text">La longitud mínima es -180°</span>
            <span *ngIf="getFieldError('longitude', 'max')" class="error-text">La longitud máxima es 180°</span>
          </div>
          <div class="field-hint" *ngIf="!isFieldInvalid('longitude') && coordForm.get('longitude')?.value">
            {{ getLongitudeHint() }}
          </div>
        </div>

        <!-- Radius Field -->
        <div class="form-group">
          <label class="form-label" for="radius">
            <span class="form-label__text">Radio de búsqueda</span>
          </label>
          <div class="radius-input-group">
            <div class="input-wrapper radius-input">
              <span class="input-prefix">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 1.5A8.5 8.5 0 1018.5 10 8.51 8.51 0 0010 1.5zm0 15a6.5 6.5 0 110-13 6.5 6.5 0 010 13zm0-11a4.5 4.5 0 100 9 4.5 4.5 0 000-9z"/>
                </svg>
              </span>
              <input
                id="radius"
                type="number"
                formControlName="radius"
                placeholder="Ej: 1000"
                min="1"
                step="1"
                [class.is-invalid]="isFieldInvalid('radius')"
                [class.is-valid]="isFieldValid('radius')"
              />
            </div>
            <select formControlName="radiusUnit" class="unit-select">
              <option value="meters">Metros</option>
              <option value="kilometers">Km</option>
            </select>
          </div>
          <div class="field-errors" *ngIf="isFieldInvalid('radius')">
            <span *ngIf="getFieldError('radius', 'required')" class="error-text">El radio es obligatorio</span>
            <span *ngIf="getFieldError('radius', 'min')" class="error-text">El radio debe ser mayor que 0</span>
            <span *ngIf="getFieldError('radius', 'max')" class="error-text">El radio máximo es {{ getMaxRadius() }}</span>
          </div>
          <div class="radius-display" *ngIf="!isFieldInvalid('radius') && coordForm.get('radius')?.value">
            <span class="radius-display__value">≈ {{ getRadiusInMeters() | number:'1.0-0' }} metros</span>
          </div>
        </div>

        <!-- Quick location buttons -->
        <div class="quick-locations">
          <p class="quick-locations__label">Ubicaciones rápidas:</p>
          <div class="quick-locations__buttons">
            <button type="button" class="quick-btn" (click)="setLocation('madrid')">Madrid</button>
            <button type="button" class="quick-btn" (click)="setLocation('barcelona')">Barcelona</button>
            <button type="button" class="quick-btn" (click)="setLocation('nyc')">Nueva York</button>
            <button type="button" class="quick-btn" (click)="setLocation('tokyo')">Tokio</button>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="submit-btn"
          [disabled]="coordForm.invalid || isLoading"
          [class.loading]="isLoading"
        >
          <svg *ngIf="!isLoading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
          </svg>
          <span class="spinner-btn" *ngIf="isLoading"></span>
          {{ isLoading ? 'Buscando...' : 'Buscar Ubicación' }}
        </button>

        <!-- Form validity indicator -->
        <div class="form-status" *ngIf="coordForm.dirty && coordForm.touched">
          <div class="form-status__indicator" [class.valid]="coordForm.valid" [class.invalid]="coordForm.invalid">
            <svg *ngIf="coordForm.valid" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
            </svg>
            <svg *ngIf="coordForm.invalid" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
            </svg>
            <span>{{ coordForm.valid ? 'Formulario válido' : 'Completa los campos requeridos' }}</span>
          </div>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./coordinate-form.component.scss']
})
export class CoordinateFormComponent implements OnInit {
  @Output() formSubmit = new EventEmitter<RadiusRequest>();

  coordForm!: FormGroup;
  isLoading = false;

  private readonly QUICK_LOCATIONS: Record<string, { lat: number; lon: number; label: string }> = {
    madrid: { lat: 40.4168, lon: -3.7038, label: 'Madrid, España' },
    barcelona: { lat: 41.3851, lon: 2.1734, label: 'Barcelona, España' },
    nyc: { lat: 40.7128, lon: -74.006, label: 'Nueva York, EEUU' },
    tokyo: { lat: 35.6762, lon: 139.6503, label: 'Tokio, Japón' }
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.coordForm = this.fb.group({
      latitude: [
        null,
        [Validators.required, Validators.min(-90), Validators.max(90)]
      ],
      longitude: [
        null,
        [Validators.required, Validators.min(-180), Validators.max(180)]
      ],
      radius: [
        1000,
        [Validators.required, Validators.min(1), Validators.max(1000000)]
      ],
      radiusUnit: ['meters', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.coordForm.invalid) {
      this.coordForm.markAllAsTouched();
      return;
    }

    const formValue = this.coordForm.value;
    const request: RadiusRequest = {
      coordinates: {
        latitude: parseFloat(formValue.latitude),
        longitude: parseFloat(formValue.longitude)
      },
      radius: {
        value: parseFloat(formValue.radius),
        unit: formValue.radiusUnit
      }
    };

    this.formSubmit.emit(request);
  }

  setLoading(loading: boolean): void {
    this.isLoading = loading;
  }

  setLocation(key: string): void {
    const loc = this.QUICK_LOCATIONS[key];
    if (loc) {
      this.coordForm.patchValue({
        latitude: loc.lat,
        longitude: loc.lon
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.coordForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  isFieldValid(fieldName: string): boolean {
    const control = this.coordForm.get(fieldName);
    return !!(control && control.valid && (control.dirty || control.touched));
  }

  getFieldError(fieldName: string, errorType: string): boolean {
    const control = this.coordForm.get(fieldName);
    return !!(control && control.errors?.[errorType]);
  }

  getLatitudeHint(): string {
    const val = this.coordForm.get('latitude')?.value;
    if (val === null || val === undefined) return '';
    if (val > 0) return `Hemisferio Norte (${val.toFixed(4)}°N)`;
    if (val < 0) return `Hemisferio Sur (${Math.abs(val).toFixed(4)}°S)`;
    return 'Ecuador (0°)';
  }

  getLongitudeHint(): string {
    const val = this.coordForm.get('longitude')?.value;
    if (val === null || val === undefined) return '';
    if (val > 0) return `Hemisferio Este (${val.toFixed(4)}°E)`;
    if (val < 0) return `Hemisferio Oeste (${Math.abs(val).toFixed(4)}°O)`;
    return 'Meridiano de Greenwich (0°)';
  }

  getRadiusInMeters(): number {
    const val = this.coordForm.get('radius')?.value;
    const unit = this.coordForm.get('radiusUnit')?.value;
    if (!val) return 0;
    return unit === 'kilometers' ? val * 1000 : val;
  }

  getMaxRadius(): string {
    const unit = this.coordForm.get('radiusUnit')?.value;
    return unit === 'kilometers' ? '1000 km' : '1.000.000 m';
  }
}
