// doc-card.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ApiService } from '../services/api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DataService } from '../services/data.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-doc-card',
  standalone: true,
  imports: [CardModule, CommonModule, ToastModule],
  templateUrl: './doc-card.component.html',
  styleUrls: ['./doc-card.component.scss'],
})
export class DocCardComponent implements OnInit {
  @Input() document: any;
  uploadedAtLocal!: string;
  lastOpenedLocal!: string;
  currentUserId: string | undefined;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private messageService: MessageService,
    private dataService: DataService,
  ) {}

  ngOnInit(): void {
    this.uploadedAtLocal = this.convertToUserTimezone(
      new Date(this.document.uploadedAt),
    );
    this.lastOpenedLocal = this.convertToUserTimezone(
      new Date(this.document.lastOpened),
    );
    this.apiService.getUserId().subscribe((userId: string | undefined) => {
      this.currentUserId = userId;
    });
  }

  convertToUserTimezone(date: Date): string {
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000,
    );
    return localDate.toLocaleString();
  }

  getDocumentName(): string {
    return this.document?.document?.originalname || 'Unknown';
  }

  getIcon(mimetype: string): string {
    if (mimetype.includes('image')) {
      return '/img-icon.png';
    } else if (mimetype.includes('pdf')) {
      return '/pdf-icon.png';
    }
    return '';
  }

  getFileSize(size: number): string {
    const gb = size / (1024 * 1024 * 1024);
    const mb = size / (1024 * 1024);
    if (gb >= 1) {
      return `${gb.toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  }

  viewDocument(id: number) {
    this.router.navigate(['/documents', id]);
  }

  deleteDocument(id: number, event: Event) {
    event.stopPropagation();
    this.apiService.getUserId().subscribe((userId: string | undefined) => {
      if (userId && userId !== 'Unknown UID') {
        this.apiService.deleteDocument(id, userId).subscribe({
          next: (res) => {
            this.dataService.notifyOther({
              refresh: true,
              type: 'delete',
              document: this.document,
            });
            this.messageService.add({
              key: 'template',
              severity: 'warn',
              summary: 'Success',
              detail: 'Document successfully deleted',
            });
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({
              key: 'template',
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete document',
            });
          },
        });
      } else {
        console.error('User ID not found');
      }
    });
  }
}
