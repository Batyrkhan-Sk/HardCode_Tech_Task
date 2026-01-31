import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, map, startWith } from 'rxjs/operators';
import { User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { UserCardComponent } from './user-card/user-card.component';
import { CreateUserModalComponent } from './create-user-modal/create-user-modal.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, UserCardComponent, CreateUserModalComponent],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {
  users$!: Observable<User[]>;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;

  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  isCreateModalOpen: boolean = false;
  currentUser: string | null = null;

  filteredUsers$!: Observable<User[]>;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    // Load users ONCE on init (not on every search)
    this.userService.loadUsers();

    this.users$ = this.userService.users$;
    this.loading$ = this.userService.loading$;
    this.error$ = this.userService.error$;

    // Set up client-side filtering with debounced search
    this.filteredUsers$ = this.searchSubject.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      map(term => this.filterUsers(this.userService.getCurrentUsers(), term)),
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

  private filterUsers(users: User[], term: string): User[] {
    if (!term.trim()) {
      return users;
    }
    const searchLower = term.toLowerCase().trim();
    return users.filter(user =>
      user.name.toLowerCase().includes(searchLower)
    );
  }

  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  onDeleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id);
      this.searchSubject.next(this.searchTerm);
    }
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