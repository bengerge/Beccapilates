import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin';
import { ClassService, ClassSession } from '../../core/services/class';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class AdminComponent implements OnInit {
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
      title: ['', Validators.required],
      instructor_name: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      max_capacity: [10, [Validators.required, Validators.min(1)]]
    });
  }

  loadClasses() {
    this.classService.getClasses().subscribe({
      next: (data) => this.classes = data,
      error: (err) => console.error(err)
    });
  }

  onSubmit() {
    if (this.classForm.invalid) return;

    this.adminService.createClass(this.classForm.value).subscribe({
      next: () => {
        alert('Új óra sikeresen létrehozva!');
        this.classForm.reset({ max_capacity: 10 });
        this.loadClasses();
      },
      error: () => alert('Hiba az óra létrehozásakor.')
    });
  }

  deleteClass(id: number) {
    if (confirm('Biztosan törölni szeretnéd ezt az órát?')) {
      this.adminService.deleteClass(id).subscribe({
        next: () => {
          alert('Óra törölve!');
          this.loadClasses();
        },
        error: () => alert('Hiba a törlés során.')
      });
    }
  }
}