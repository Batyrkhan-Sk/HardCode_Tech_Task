import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, map, startWith } from 'rxjs/operators';
import { User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { UserCardComponent } from './user-card/user-card.component';
import { CreateUserModalComponent } from './create-user-modal/create-user-modal.component';
import { DeleteConfirmationModalComponent } from './delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, UserCardComponent, CreateUserModalComponent, DeleteConfirmationModalComponent],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {
  users$!: Observable<User[]>;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;

  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  private sortSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  isCreateModalOpen: boolean = false;
  currentUser: string | null = null;
  sortBy: 'name' | 'email' | 'city' = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';

  isDeleteModalOpen: boolean = false;
  userToDelete: User | null = null;

  filteredUsers$!: Observable<User[]>;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    this.userService.loadUsers();

    this.users$ = this.userService.users$;
    this.loading$ = this.userService.loading$;
    this.error$ = this.userService.error$;

    this.filteredUsers$ = combineLatest([
      this.users$,
      this.searchSubject.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged()
      ),
      this.sortSubject.pipe(startWith(undefined))
    ]).pipe(
      map(([users, searchTerm]) => this.filterAndSortUsers(users, searchTerm)),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  private filterAndSortUsers(users: User[], term: string): User[] {
    let filtered = users;
    if (term.trim()) {
      const searchLower = term.toLowerCase().trim();
      filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchLower)
      );
    }

    return this.sortUsers(filtered);
  }

  private sortUsers(users: User[]): User[] {
    return [...users].sort((a, b) => {
      let valueA: string;
      let valueB: string;

      switch (this.sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'email':
          valueA = a.email.toLowerCase();
          valueB = b.email.toLowerCase();
          break;
        case 'city':
          valueA = a.address.city.toLowerCase();
          valueB = b.address.city.toLowerCase();
          break;
        default:
          return 0;
      }

      if (this.sortOrder === 'asc') {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });
  }

  setSortBy(field: 'name' | 'email' | 'city'): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.sortSubject.next();
  }

  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  onDeleteUser(id: number): void {
    const user = this.userService.getCurrentUsers().find(u => u.id === id);
    if (user) {
      this.userToDelete = user;
      this.isDeleteModalOpen = true;
    }
  }

  confirmDelete(): void {
    if (this.userToDelete) {
      this.userService.deleteUser(this.userToDelete.id);
      this.closeDeleteModal();
    }
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.userToDelete = null;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  retryLoad(): void {
    this.userService.loadUsers();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchSubject.next('');
  }

  trackByUserId(index: number, user: User): number {
    return user.id;
  }
}