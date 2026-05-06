import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin';
import { AuthService } from '../../core/services/auth';
import { ToastService } from '../../core/services/toast';

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
  private toastService = inject(ToastService);

  users: any[] = [];
  currentUserId: number | null = null;

  // Modal állapotkezelés
  isModalOpen = false;
  pendingUserId: number | null = null;
  pendingRole: string | null = null;

  ngOnInit() {
    this.loadUsers();
    this.authService.currentUser$.subscribe(user => {
      if (user) this.currentUserId = Number(user.sub);
    });
  }

  loadUsers() {
    this.adminService.getUsers().subscribe(data => this.users = data);
  }

  // Ez fut le, amikor átkattintják a selectet
  openConfirmModal(userId: number, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.pendingRole = selectElement.value;
    this.pendingUserId = userId;
    this.isModalOpen = true;
  }

  // Modal bezárása mentés nélkül
  closeModal() {
    this.isModalOpen = false;
    this.pendingUserId = null;
    this.pendingRole = null;
    
    // Lista újratöltése, hogy a select visszaugorjon az eredeti (adatbázis szerinti) értékre
    this.loadUsers();
  }

  // Véglegesítés a modalból
  confirmRoleChange() {
    if (this.pendingUserId && this.pendingRole) {
      this.adminService.updateUserRole(this.pendingUserId, this.pendingRole).subscribe({
        next: () => {
          this.toastService.show('Jogosultság sikeresen módosítva!', 'success');
          this.isModalOpen = false;
          this.pendingUserId = null;
          this.pendingRole = null;
          this.loadUsers();
        },
        error: () => {
          this.toastService.show('Hiba a jogosultság módosításakor.', 'error');
          this.isModalOpen = false;
          this.loadUsers();
        }
      });
    }
  }
}