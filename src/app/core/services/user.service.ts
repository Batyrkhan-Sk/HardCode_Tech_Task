import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, tap, delay } from 'rxjs/operators';
import { User, CreateUserDto } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'https://jsonplaceholder.typicode.com/users';
  private readonly STORAGE_KEY = 'user_list';

  private usersSubject = new BehaviorSubject<User[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  public users$ = this.usersSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  private nextLocalId = 1000;

  constructor(private http: HttpClient) {
    this.loadUsersFromStorage();
  }

  loadUsers(): void {
    const storedUsers = this.getStoredUsers();

    if (storedUsers.length > 0) {
      this.usersSubject.next(storedUsers);
      this.updateNextLocalId(storedUsers);
    } else {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);

      this.http.get<User[]>(this.API_URL)
        .pipe(
          delay(500),
          tap(users => this.saveUsersToStorage(users)),
          catchError(this.handleError.bind(this))
        )
        .subscribe({
          next: (users) => {
            this.usersSubject.next(users);
            this.updateNextLocalId(users);
            this.loadingSubject.next(false);
          },
          error: () => {
            this.loadingSubject.next(false);
          }
        });
    }
  }

  createUser(userDto: CreateUserDto): Observable<User> {
    const currentUsers = this.usersSubject.value;

    const newUser: User = {
      id: this.nextLocalId++,
      name: userDto.name,
      username: this.generateUsername(userDto.name),
      email: userDto.email,
      address: {
        street: '',
        suite: '',
        city: userDto.city,
        zipcode: '',
        geo: { lat: '0', lng: '0' }
      },
      phone: '',
      website: '',
      company: { name: '', catchPhrase: '', bs: '' }
    };

    const updatedUsers = [newUser, ...currentUsers];
    this.usersSubject.next(updatedUsers);
    this.saveUsersToStorage(updatedUsers);

    return of(newUser);
  }

  deleteUser(id: number): void {
    const currentUsers = this.usersSubject.value;
    const updatedUsers = currentUsers.filter(user => user.id !== id);
    this.usersSubject.next(updatedUsers);
    this.saveUsersToStorage(updatedUsers);
  }

  getCurrentUsers(): User[] {
    return this.usersSubject.value;
  }

  private saveUsersToStorage(users: User[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private getStoredUsers(): User[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  private loadUsersFromStorage(): void {
    const storedUsers = this.getStoredUsers();
    if (storedUsers.length > 0) {
      this.usersSubject.next(storedUsers);
      this.updateNextLocalId(storedUsers);
    }
  }

  private updateNextLocalId(users: User[]): void {
    if (users.length > 0) {
      const maxId = Math.max(...users.map(u => u.id));
      this.nextLocalId = Math.max(maxId + 1, 1000);
    }
  }

  private generateUsername(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '.');
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred while loading users.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Server returned code ${error.status}: ${error.message}`;
    }

    this.errorSubject.next(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}