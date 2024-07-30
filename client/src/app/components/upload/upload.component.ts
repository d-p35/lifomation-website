import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DataService } from '../../services/data.service';
import { PrimeNGConfig } from 'primeng/api';
import { InfoCircleIcon } from 'primeng/icons/infocircle';
import { TimesIcon } from 'primeng/icons/times';
import { Ripple, RippleModule } from 'primeng/ripple';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { CategoryService } from '../../services/categories.service';
import { FormsModule } from '@angular/forms';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    FileUploadModule,
    ToastModule,
    TimesIcon,
    InfoCircleIcon,
    RippleModule,
    Ripple,
    ProgressSpinnerModule,
    CommonModule,
    DropdownModule,
    FormsModule,
  ],
  templateUrl: './upload.component.html',
  styleUrls: [
    './upload.component.scss',
    '../../layout/header/header.component.scss',
  ],
})
export class UploadComponent implements OnInit {
  selectedFile: File | null = null;
  visible: boolean = false;
  userId: string | undefined;
  email: string | undefined;
  documentisProcessing: boolean = false;
  selectedCategory: string = '';
  selectedCategories: string[] = [];
  categories: string[] = [];
  changeCategoryIsProcessing: boolean = false;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private dataService: DataService,
    private primengConfig: PrimeNGConfig,
    private categoryService: CategoryService,
  ) {}

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.categories = this.categoryService.getCategories();
    document.addEventListener('click', this.handleClickOutside.bind(this));
    combineLatest([
      this.apiService.getUserId(),
      this.apiService.getUserEmail(),
    ]).subscribe(
      ([userId, email]: [string | undefined, string | undefined]) => {
        if (userId) {
          this.userId = userId;
        } else {
          console.error('User ID not found');
        }

        if (email) {
          this.email = email;
        } else {
          console.error('User email not found');
        }
      },
    );
  }
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const uploadElement = document.querySelector('.upload-container');
    if (uploadElement && !uploadElement.contains(target)) {
      this.visible = false;
    }
  }
  ngOnDestroy() {
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }
  showDialog() {
    this.visible = true;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] || null;
  }

  changeCategory(document: any) {
    if (!this.selectedCategory) return;
    this.changeCategoryIsProcessing = true;
    if (this.selectedCategory === this.selectedCategories[0]) {
      this.messageService.clear('custom');
      this.changeCategoryIsProcessing = false;
      return;
    }
    this.selectedCategories.unshift(this.selectedCategory);
    this.selectedCategories = [...new Set(this.selectedCategories)];
    this.apiService.getUserId().subscribe((userId: string | undefined) => {
      if (userId && userId !== 'Unknown UID') {
        this.apiService
          .changeCategory(
            document.id,
            this.selectedCategories.join(','),
            userId,
          )
          .subscribe({
            next: (res) => {
              this.changeCategoryIsProcessing = false;
              this.messageService.clear('custom');

              //@d-p35 Todo: Click this toast and it takes you to the document
              this.messageService.add({
                key: 'bottomright',
                severity: 'success',
                summary: `Your document has been added to ${this.selectedCategory} category`,
                detail: `You can view it in the ${this.selectedCategory} folder.`,
              });
              this.dataService.notifyOther({ refresh: true });
            },
            error: (err) => {
              console.error(err);
              this.changeCategoryIsProcessing = false;
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Category change failed',
              });
            },
          });
      } else {
        console.error('User ID not found');
      }
    });
  }

  uploadFile() {
    if (this.selectedFile) {
      this.documentisProcessing = true;
      const formData = new FormData();
      formData.append('document', this.selectedFile);
      if (this.userId) formData.append('userId', this.userId || '');
      if (this.email) formData.append('email', this.email || '');
      this.apiService.uploadDocument(formData).subscribe({
        next: (res) => {
          this.clearFileInput();
          this.messageService.add({
            key: 'template',
            severity: 'success',
            summary: 'Success',
            detail: 'Document uploaded successfully',
          });
          this.selectedCategories = res.document.category
            .split(',')
            .map((category: string) => category.trim());

          if (
            !this.selectedCategories ||
            this.selectedCategories.length === 0
          ) {
            this.selectedCategories = ['Uncategorized'];
          }

          this.selectedCategory = this.selectedCategories[0];

          setTimeout(() => {
            this.messageService.clear('template');
            this.messageService.add({
              key: 'custom',
              severity: 'info',
              summary: `Your document has been added to ${this.selectedCategory} category`,
              detail: `You can view it in the ${this.selectedCategory} folder.`,
              data: res.document,
              life: 20000,
            });
          }, 3000);
          this.dataService.notifyOther({
            refresh: true,
            document: res.document,
            type: 'upload',
          });
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Document upload failed',
          });
        },
      });
    }
  }

  clearFileInput() {
    document.getElementById('fileInput')?.setAttribute('value', '');
    this.selectedFile = null;
    this.visible = false;
    this.documentisProcessing = false;
  }
}
