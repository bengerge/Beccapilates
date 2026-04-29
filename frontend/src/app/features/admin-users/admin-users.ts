import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-users.html',
  styleUrls: ['./admin-users.scss']
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);

  users: any[] = [];
  currentUserId: number | null = null;

  ngOnInit() {
    this.loadUsers();
    this.authService.currentUser$.subscribe(user => {
      if (user) this.currentUserId = Number(user.sub);
    });
  }

  loadUsers() {
    this.adminService.getUsers().subscribe(data => this.users = data);
  }

  changeRole(userId: number, event: Event) {
    const role = (event.target as HTMLSelectElement).value;
    if (confirm('Módosítod a jogosultságot?')) {
      this.adminService.updateUserRole(userId, role).subscribe({
        next: () => this.loadUsers()
      });
    }
  }
}