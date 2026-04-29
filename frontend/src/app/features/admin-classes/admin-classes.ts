import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin';
import { ClassService, ClassSession } from '../../core/services/class';

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

  classes: ClassSession[] = [];
  classForm!: FormGroup;

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
  }

  loadClasses() {
    this.classService.getClasses().subscribe({
      next: (data) => {
        this.classes = data.sort((a, b) => 
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
      },
      error: (err) => console.error('Hiba az órák betöltésekor:', err)
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
        this.classForm.reset({ 
          max_capacity: 10, 
          difficulty: 'beginner' 
        });
        this.loadClasses();
      },
      error: (err) => alert('Hiba történt: ' + (err.error?.detail?.[0]?.msg || 'Ismeretlen hiba'))
    });
  }

  deleteClass(id: number) {
    if (confirm('Biztosan törölni szeretnéd ezt az órát?')) {
      this.adminService.deleteClass(id).subscribe({
        next: () => this.loadClasses()
      });
    }
  }
}