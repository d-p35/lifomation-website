import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NgFor } from '@angular/common';
import { TableModule } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-doc-list',
  standalone: true,
  imports: [NgFor, TableModule],
  templateUrl: './doc-list.component.html',
  styleUrls: ['./doc-list.component.scss'],
})
export class DocListComponent implements OnInit {
  @Input() documents: any[] = [];
  totalRecords: number = 0;
  rows: number = 10;
  currentPage = 0;
  itemsPerPage = 10; // Number of documents per page

  constructor(
    private router: Router,
    private apiService: ApiService,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.fetchDocuments();
    this.dataService.notifyObservable$.subscribe((res) => {
      if (res && res.refresh) {
        this.fetchDocuments();
      }
    });
  }

  fetchDocuments() {
    this.apiService.getUserId().subscribe((userId: string | undefined) => {
      if (userId && userId !== 'Unknown UID') {
        this.apiService
          .getDocuments(this.currentPage, this.itemsPerPage, userId)
          .subscribe({
            next: (res) => {
              this.documents = res.documents.map((doc: any) => ({
                ...doc,
                uploadedAtLocal: this.convertToUserTimezone(
                  new Date(doc.uploadedAt)
                ),
                lastOpenedLocal: this.convertToUserTimezone(
                  new Date(doc.lastOpened)
                ),
                fileSize: this.getFileSize(doc.document.size),
              }));
              this.totalRecords = res.totalRecords; // Adjust according to your API response
            },
            error: (err) => {
              console.error(err);
            },
          });
      } else {
        console.error('User ID not found');
      }
    });
  }

  loadDocuments(event: any) {
    this.currentPage = event.first
      ? Math.floor(event.first / (event.rows ?? this.rows))
      : 0;
    this.itemsPerPage =
      event.rows !== null && event.rows !== undefined ? event.rows : this.rows;
    if (this.currentPage < 0) {
      this.currentPage = 0;
    }
    this.apiService
      .getDocuments(this.currentPage, this.itemsPerPage)
      .subscribe({
        next: (res) => {
          this.documents = res.documents.map((doc: any) => ({
            ...doc,
            uploadedAtLocal: this.convertToUserTimezone(
              new Date(doc.uploadedAt)
            ),
            lastOpenedLocal: this.convertToUserTimezone(
              new Date(doc.lastOpened)
            ),
            fileSize: this.getFileSize(doc.document.size),
          }));
          this.totalRecords = res.totalRecords; // Adjust according to your API response
        },
        error: (err) => {
          console.error(err);
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

  getIcon(mimetype: string): string {
    if (mimetype.includes('image')) {
      return '../../..//public/doc-icon.png';
    } else if (mimetype.includes('pdf')) {
      return '../../..//public/pdf-icon.png';
    }
    return '';
  }

  viewDocument(id: number) {
    this.router.navigate(['/documents', id]);
  }

  deleteDocument(id: number, event: Event) {
    event.stopPropagation();
    this.apiService.getUserId().subscribe((userId: string | undefined) => {
      if (userId && userId !== 'Unknown UID') {
        this.apiService.deleteDocument(id, userId).subscribe({
          next: () => {
            this.documents = this.documents.filter((doc) => doc.id !== id);
          },
          error: (err) => {
            console.error(err);
          },
        });
      }else{
        console.error('User ID not found');
      }
      
    });
  }
}
