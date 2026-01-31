import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from '../../../core/services/user.service';
import { CreateUserDto } from '../../../core/models/user.model';

@Component({
  selector: 'app-create-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-user-modal.component.html',
  styleUrls: ['./create-user-modal.component.css']
})
export class CreateUserModalComponent implements OnDestroy {
  @Output() close = new EventEmitter<void>();

  createForm: FormGroup;
  isSubmitting: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      city: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.markFormGroupTouched(this.createForm);
      return;
    }

    this.isSubmitting = true;
    const userDto: CreateUserDto = this.createForm.value;

    this.userService.createUser(userDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.onClose();
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.isSubmitting = false;
        }
      });
  }

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.createForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.createForm.get(fieldName);

    if (field?.hasError('required')) {
      return `${this.capitalizeFirst(fieldName)} is required`;
    }

    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }

    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `${this.capitalizeFirst(fieldName)} must be at least ${minLength} characters`;
    }

    return '';
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}