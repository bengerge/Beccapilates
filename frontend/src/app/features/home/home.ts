import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// FONTOS: Nincs .service a fájlnevekben!
import { ClassService, ClassSession } from '../../core/services/class';
import { AuthService } from '../../core/services/auth';
import { UiService } from '../../core/services/ui';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  private classService = inject(ClassService);
  private authService = inject(AuthService);
  private uiService = inject(UiService);

  classes: ClassSession[] = [];

  ngOnInit() {
    this.loadClasses();
  }

  loadClasses() {
    this.classService.getClasses().subscribe({
      next: (data) => this.classes = data,
      error: (err) => console.error('Hiba az órák betöltésekor:', err)
    });
  }

  book(classId: number) {
    if (!this.authService.getCurrentUser()) {
      this.uiService.openAuthModal();
      return;
    }
    
    this.classService.bookClass(classId).subscribe({
      next: () => {
        alert('Sikeres foglalás!');
        this.loadClasses();
      },
      error: (err) => {
        const errorMsg = err.error?.detail || 'Sikertelen foglalás. Lehet, hogy betelt az óra?';
        alert(errorMsg);
      }
    });
  }
}