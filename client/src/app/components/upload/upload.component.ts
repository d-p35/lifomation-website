import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss',
})
export class UploadComponent {
  selectedFile: File | null = null;
  @Output() documentUploaded = new EventEmitter<any>();
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor( private apiService: ApiService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] || null;
  }


  uploadFile() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('document', this.selectedFile);
      this.apiService.uploadDocument(formData).subscribe({
        next: (res) => {
          this.documentUploaded.emit(res.document);
          this.clearFileInput();
        },
        error: (err) => {
          console.error(err);
        }
      });

    }
  }


  clearFileInput() {
    this.fileInput.nativeElement.value = '';
    this.selectedFile = null;
  }

}
