import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ApiService } from '../../services/api.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DataService } from '../../services/data.service';
import { Message, PrimeNGConfig, PrimeTemplate, SharedModule } from 'primeng/api';
import { CheckIcon } from 'primeng/icons/check';
import { ExclamationTriangleIcon } from 'primeng/icons/exclamationtriangle';
import { InfoCircleIcon } from 'primeng/icons/infocircle';
import { TimesIcon } from 'primeng/icons/times';
import { TimesCircleIcon } from 'primeng/icons/timescircle';
import { Ripple, RippleModule } from 'primeng/ripple';
import { ObjectUtils, UniqueComponentId, ZIndexUtils } from 'primeng/utils';
import { Subscription } from 'rxjs';
import { DomHandler } from 'primeng/dom';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';

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
    CommonModule
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
  changeCategoryModal: boolean = false;
  documentisProcessing: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private dataService: DataService,
    private primengConfig: PrimeNGConfig
  ) {}

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    
    this.apiService.getUserId().subscribe((userId: string | undefined) => {
      if (userId) {
        this.userId = userId;
      } else {
        console.error('User ID not found');
      }
    });
  }

  showDialog() {
    this.visible = true;
  }

  showCategoryChangeModal(){
    this.changeCategoryModal = true;
    console.log('showCategoryChangeModal');

  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] || null;
    // this.messageService.add({
    //   key: 'custom',
    //   severity: 'info',
    //   summary: `Your document has been added to asfsafdfasdfsf category`,
    //   detail: `You can view it in the asdfasdasadfadsa folder.`,
    //   life: 20000,
    // });
  }

  uploadFile() {
    if (this.selectedFile) {
      this.documentisProcessing = true
      const formData = new FormData();
      formData.append('document', this.selectedFile);
      if (this.userId) formData.append('userId', this.userId || '');
      this.apiService.uploadDocument(formData).subscribe({
        next: (res) => {
          this.clearFileInput();
          this.messageService.add({
            key: 'template',
            severity: 'success',
            summary: 'Success',
            detail: 'Document uploaded successfully',
          });
          
          setTimeout(() => {
            this.messageService.clear('template');
            this.messageService.add({
              key: 'custom',
              severity: 'info',
              summary: `Your document has been added to ${res.document.category} category`,
              detail: `You can view it in the ${res.document.category} folder.`,
              life: 20000,
            });
          }, 5000);
          this.dataService.notifyOther({ refresh: true });
          this.documentisProcessing = false;
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
  }
}
