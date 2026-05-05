import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin';
import { ClassService, ClassSession } from '../../core/services/class';
import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'app-admin-classes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-classes.html',
  styleUrls: ['./admin-classes.scss']
})
export class AdminClassesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private classService = inject(ClassService);
  private toastService = inject(ToastService);

  classes: ClassSession[] = [];
  classForm!: FormGroup;

  difficultyMap: Record<string, string> = {
    'beginner': 'Kezdő',
    'intermediate': 'Középhaladó',
    'advanced': 'Haladó'
  };
  
  ngOnInit() {
    this.initForm();
    this.loadClasses();
  }

  initForm() {
    this.classForm = this.fb.group({
      name: ['', Validators.required],
      difficulty: ['beginner', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      location: ['', Validators.required],
      max_capacity: [10, [Validators.required, Validators.min(1)]],
      description: ['']
    });

    // ÚJ: Automatikus +1 óra kalkuláció a befejezéshez
    this.classForm.get('start_time')?.valueChanges.subscribe(startTime => {
      if (startTime) {
        const startDate = new Date(startTime);
        startDate.setHours(startDate.getHours() + 1); // +1 óra hozzáadása
        
        // Helyi időzónához igazított formátum (YYYY-MM-DDTHH:mm), amit a datetime-local input elfogad
        const tzOffset = startDate.getTimezoneOffset() * 60000;
        const localISOTime = new Date(startDate.getTime() - tzOffset).toISOString().slice(0, 16);
        
        // Csendben (emitEvent: false) frissítjük a vége mezőt, hogy ne okozzunk végtelen ciklust
        this.classForm.patchValue({ end_time: localISOTime }, { emitEvent: false });
      }
    });
  }

  loadClasses() {
    this.classService.getClasses().subscribe({
      next: (data) => {
        this.classes = data.sort((a, b) => 
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
      },
      error: () => this.toastService.show('Nem sikerült betölteni a meglévő órákat.', 'error')
    });
  }

  onSubmit() {
    if (this.classForm.invalid) return;

    const payload = {
      ...this.classForm.value,
      max_capacity: Number(this.classForm.value.max_capacity)
    };

    this.adminService.createClass(payload).subscribe({
      next: () => {
        this.toastService.show('Új óra sikeresen meghirdetve!', 'success');
        this.classForm.reset({ 
          max_capacity: 10, 
          difficulty: 'beginner' 
        });
        this.loadClasses();
      },
      error: (err) => {
        const errorMsg = err.error?.detail?.[0]?.msg || err.error?.detail || 'Ismeretlen hiba';
        this.toastService.show(`Hiba történt: ${errorMsg}`, 'error');
      }
    });
  }

  getDifficultyLabel(level: string): string {
    return this.difficultyMap[level] || level;
  }
}