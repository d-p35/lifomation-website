import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DataService } from '../../services/data.service';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';

interface Document {
  id: number;
  uploadedAt: string;
  lastOpened: string;
  document: {
    originalname: string;
    size: number;
    mimetype: string;
  };
  uploadedAtLocal?: string;
  lastOpenedLocal?: string;
  fileSize?: string;
}

@Component({
  selector: 'app-doc-list',
  standalone: true,
  imports: [TableModule],
  templateUrl: './doc-list.component.html',
  styleUrls: ['./doc-list.component.scss'],
})
export class DocListComponent implements OnInit {
  @Input() documents: Document[] = [];
  @Input() document: any;
  uploadedAtLocal!: string;
  lastOpenedLocal!: string;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private messageService: MessageService,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.fetchDocuments();
    this.dataService.notifyObservable$.subscribe((res) => {
      if (res && res.refresh) {
        this.fetchDocuments();
      }
    });
    this.uploadedAtLocal = this.convertToUserTimezone(
      new Date(this.document.uploadedAt)
    );
    this.lastOpenedLocal = this.convertToUserTimezone(
      new Date(this.document.lastOpened)
    );
  }

  fetchDocuments() {
    this.apiService.getDocuments().subscribe({
      next: (res) => {
        this.documents = res.documents.map((doc: Document) => ({
          ...doc,
          uploadedAtLocal: this.convertToUserTimezone(new Date(doc.uploadedAt)),
          lastOpenedLocal: this.convertToUserTimezone(new Date(doc.lastOpened)),
          fileSize: this.getFileSize(doc.document.size),
        }));
        console.log(this.documents);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  addDocument(document: Document) {
    this.documents.push(document);
  }

  viewDocument(id: number) {
    this.router.navigate(['/documents', id]);
  }

  deleteDocument(id: number, event: Event) {
    event.stopPropagation();
    this.apiService.deleteDocument(id).subscribe({
      next: (res) => {
        this.documents = this.documents.filter((doc) => doc.id !== id);
        this.dataService.notifyOther({ refresh: true });
        this.messageService.add({
          severity: 'warn',
          summary: 'Success',
          detail: 'Document successfully deleted',
        });
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete document',
        });
      },
    });
  }

  convertToUserTimezone(date: Date): string {
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    return localDate.toLocaleString();
  }

  getFileSize(size: number): string {
    const gb = size / (1024 * 1024 * 1024);
    const mb = size / (1024 * 1024);
    if (gb >= 1) {
      return `${gb.toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  }
}
