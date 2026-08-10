import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cookie-overlay" *ngIf="isVisible && showModal"></div>

    <div class="cookie-banner" *ngIf="isVisible && !showModal">
      <div class="banner-content">
        <p>Weboldalunk sütiket használ a felhasználói élmény javítása és az oldal működésének biztosítása érdekében.</p>
        <div class="banner-actions">
          <button class="btn-primary" (click)="acceptAll()">Összes elfogadása</button>
          <button class="btn-secondary" (click)="rejectAll()">Elutasítás</button>
          <button class="btn-text" (click)="openCustom()">Személyre szabás</button>
        </div>
      </div>
    </div>

    <div class="cookie-modal" *ngIf="isVisible && showModal">
      <h2>Süti beállítások</h2>
      <p>Kérjük, válassza ki, milyen sütik használatát engedélyezi. Az elengedhetetlen sütik a weboldal működéséhez szükségesek.</p>
      
      <div class="cookie-option">
        <label>
          <input type="checkbox" [checked]="preferences.essential" disabled>
          Elengedhetetlen (Technikai) sütik
        </label>
        <span>Mindig aktív</span>
      </div>

      <div class="cookie-option">
        <label>
          <input type="checkbox" [(ngModel)]="preferences.analytics">
          Statisztikai sütik
        </label>
      </div>

      <div class="cookie-option">
        <label>
          <input type="checkbox" [(ngModel)]="preferences.marketing">
          Marketing sütik
        </label>
      </div>

      <div class="modal-actions">
        <button class="btn-primary" (click)="saveCustom()">Beállítások mentése</button>
        <button class="btn-text" (click)="acceptAll()">Inkább mindet elfogadom</button>
      </div>
    </div>
  `,
  styles: [`
    .cookie-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 9998; }
    .cookie-banner { position: fixed; bottom: 0; left: 0; width: 100%; background: #ffffff; color: #333; box-shadow: 0 -2px 10px rgba(0,0,0,0.1); z-index: 9999; padding: 20px; box-sizing: border-box; }
    .banner-content { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 15px; align-items: center; text-align: center; }
    @media (min-width: 768px) { .banner-content { flex-direction: row; justify-content: space-between; text-align: left; } }
    .banner-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
    
    .cookie-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; padding: 30px; border-radius: 8px; width: 90%; max-width: 500px; z-index: 9999; box-shadow: 0 4px 20px rgba(0,0,0,0.15); color: #333; }
    .cookie-modal h2 { margin-top: 0; }
    .cookie-option { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee; }
    .cookie-option label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-weight: 500; }
    .cookie-option span { font-size: 0.9em; color: #888; }
    .modal-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 25px; }
    
    button { padding: 10px 20px; border-radius: 4px; border: none; cursor: pointer; font-weight: 600; transition: all 0.2s; }
    .btn-primary { background: #222; color: #fff; }
    .btn-primary:hover { background: #444; }
    .btn-secondary { background: #eee; color: #333; }
    .btn-secondary:hover { background: #ddd; }
    .btn-text { background: transparent; color: #555; text-decoration: underline; }
    .btn-text:hover { color: #000; }
  `]
})
export class CookieBannerComponent implements OnInit {
  isVisible = false;
  showModal = false;
  
  preferences: CookiePreferences = {
    essential: true,
    analytics: false,
    marketing: false
  };

  ngOnInit(): void {
    const saved = localStorage.getItem('cookiePreferences');
    if (!saved) {
      this.isVisible = true;
    } else {
      this.preferences = JSON.parse(saved);
      this.applyCookieRules();
    }
  }

  acceptAll(): void {
    this.preferences.analytics = true;
    this.preferences.marketing = true;
    this.save();
  }

  rejectAll(): void {
    this.preferences.analytics = false;
    this.preferences.marketing = false;
    this.save();
  }

  openCustom(): void {
    this.showModal = true;
  }

  saveCustom(): void {
    this.save();
  }

  private save(): void {
    localStorage.setItem('cookiePreferences', JSON.stringify(this.preferences));
    this.isVisible = false;
    this.showModal = false;
    this.applyCookieRules();
  }

  private applyCookieRules(): void {
    if (this.preferences.analytics) {
      
    }
    if (this.preferences.marketing) {
      
    }
  }
}