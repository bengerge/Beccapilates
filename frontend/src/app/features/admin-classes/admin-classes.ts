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
  locations: any[] = [];
  difficulties: any[] = [];

  classForm!: FormGroup;
  locationForm!: FormGroup;
  difficultyForm!: FormGroup;
  
  ngOnInit() {
    this.initForm();
    this.loadClasses();
    this.loadDictionaries();
  }

  initForm() {
    this.classForm = this.fb.group({
      name: ['', Validators.required],
      difficulty: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      location: ['', Validators.required],
      max_capacity: [10, [Validators.required, Validators.min(1)]],
      description: ['']
    });

    this.locationForm = this.fb.group({
      name: ['', Validators.required]
    });

    this.difficultyForm = this.fb.group({
      name: ['', Validators.required]
    });

    this.classForm.get('start_time')?.valueChanges.subscribe(startTime => {
      if (startTime) {
        const startDate = new Date(startTime);
        startDate.setHours(startDate.getHours() + 1);
        const tzOffset = startDate.getTimezoneOffset() * 60000;
        const localISOTime = new Date(startDate.getTime() - tzOffset).toISOString().slice(0, 16);
        this.classForm.patchValue({ end_time: localISOTime }, { emitEvent: false });
      }
    });
  }

  loadDictionaries() {
    this.adminService.getLocations().subscribe({
      next: (data) => this.locations = data,
      error: () => this.toastService.show('Nem sikerült betölteni a helyszíneket.', 'error')
    });
    this.adminService.getDifficulties().subscribe({
      next: (data) => this.difficulties = data,
      error: () => this.toastService.show('Nem sikerült betölteni a nehézségi szinteket.', 'error')
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

  addLocation() {
    if (this.locationForm.invalid) return;
    this.adminService.createLocation(this.locationForm.value.name).subscribe({
      next: () => {
        this.toastService.show('Helyszín hozzáadva!', 'success');
        this.locationForm.reset();
        this.loadDictionaries();
      },
      error: () => this.toastService.show('Hiba a helyszín hozzáadásakor', 'error')
    });
  }

  deleteLocation(id: number) {
    this.adminService.deleteLocation(id).subscribe({
      next: () => {
        this.toastService.show('Helyszín törölve!', 'success');
        this.loadDictionaries();
      },
      error: () => this.toastService.show('Hiba a törléskor', 'error')
    });
  }

  addDifficulty() {
    if (this.difficultyForm.invalid) return;
    this.adminService.createDifficulty(this.difficultyForm.value.name).subscribe({
      next: () => {
        this.toastService.show('Nehézségi szint hozzáadva!', 'success');
        this.difficultyForm.reset();
        this.loadDictionaries();
      },
      error: () => this.toastService.show('Hiba a szint hozzáadásakor', 'error')
    });
  }

  deleteDifficulty(id: number) {
    this.adminService.deleteDifficulty(id).subscribe({
      next: () => {
        this.toastService.show('Nehézségi szint törölve!', 'success');
        this.loadDictionaries();
      },
      error: () => this.toastService.show('Hiba a törléskor', 'error')
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
          difficulty: '',
          location: ''
        });
        this.loadClasses();
      },
      error: (err) => {
        const errorMsg = err.error?.detail?.[0]?.msg || err.error?.detail || 'Ismeretlen hiba';
        this.toastService.show(`Hiba történt: ${errorMsg}`, 'error');
      }
    });
  }
}