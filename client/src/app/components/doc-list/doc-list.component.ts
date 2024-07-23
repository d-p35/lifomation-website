import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule, NgFor } from '@angular/common';
import { TableModule } from 'primeng/table';
import { LazyLoadEvent, MessageService } from 'primeng/api';
import { DataService } from '../../services/data.service';
import { ScrollerModule } from 'primeng/scroller';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-doc-list',
  standalone: true,
  imports: [NgFor, TableModule, ScrollerModule, InfiniteScrollDirective, ButtonModule,ProgressSpinnerModule, CommonModule, ToastModule],
  templateUrl: './doc-list.component.html',
  styleUrls: ['./doc-list.component.scss'],
})
export class DocListComponent implements OnInit {
  @Input() documents: any[] = [];
  totalRecords: number = 0;
  rows: number = 10;
  currentPage = 0;
  itemsPerPage = 10; // Number of documents per page
  folderName: any;
  loading: boolean = true;
  userId: string | undefined;
  loadedAll: boolean = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private dataService: DataService,
    private route: ActivatedRoute,
    private messageService: MessageService,
  ) {}



  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.loading = true;
      this.folderName = params['folder'];
      this.apiService.getUserId().subscribe((userId: string | undefined) => {
        if (userId && userId !== 'Unknown UID') {
          this.userId = userId;
          this.currentPage = 0;
          this.loadedAll = false;
          this.documents = [];
          this.totalRecords = 0;
          console.log('asdasdasdasdasd ID:', userId);
          console.log('asdasdasdasdasd folder:', this.folderName);
          this.fetchDocumentsByPage(this.currentPage, this.itemsPerPage, userId);
        } else {
          console.error('User ID not found');
        }
      }); 
    });

    this.dataService.notifyObservable$.subscribe((res) => {
      if (res && res.refresh) {
        if (res.document && (res.document.category==this.folderName || !this.folderName)) {
          if (res.type=='delete') this.documents = this.documents.filter((doc) => doc.id !== res.document.id);
          else if (res.type=='upload') this.documents = [{
            ...res.document,
            uploadedAtLocal: this.convertToUserTimezone(new Date(res.document.uploadedAt)),
            lastOpenedLocal: this.convertToUserTimezone(new Date(res.document.lastOpened)),
            fileSize: this.getFileSize(res.document.document.size),
          }, ...this.documents];
        }
      }
    });
  }

  onScroll() {
    if (!this.userId) return;
    this.fetchDocumentsByPage(this.currentPage+1, this.itemsPerPage, this.userId);
  }

  fetchDocumentsByPage(page: number, itemsPerPage: number, userId?: string) {
    if (!this.loadedAll){
    this.apiService.getDocuments(page, itemsPerPage, userId, this.folderName).subscribe({
      next: (res) => {
        this.documents = this.documents.concat(res.documents.map((doc: any) => ({
          ...doc,
          uploadedAtLocal: this.convertToUserTimezone(new Date(doc.uploadedAt)),
          lastOpenedLocal: this.convertToUserTimezone(new Date(doc.lastOpened)),
          fileSize: this.getFileSize(doc.document.size),
        })));
        this.totalRecords = res.count;
        if (this.documents.length >= this.totalRecords) {
          this.loadedAll = true;
        }
        this.currentPage = page;
        this.loading = false;
        
        console.log(this.documents);
        console.log(this.loadedAll)
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
  }

  fetchInitialDocuments() {
    this.apiService.getUserId().subscribe((userId: string | undefined) => {
      if (userId && userId !== 'Unknown UID') {
        this.fetchDocumentsByPage(this.currentPage, this.itemsPerPage, userId);
      } else {
        console.error('User ID not found');
      }
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
      return '../../..//public/img-icon.png';
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
    this.apiService.deleteDocument(id).subscribe({
      next: () => {
        this.documents = this.documents.filter((doc) => doc.id !== id);
        this.messageService.add({
          key:'template',
          severity: 'warn',
          summary: 'Success',
          detail: 'Document successfully deleted',
        });
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          key:'template',
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete document',
        });
      },
    });
  }

  starDocument(doc: any, event: Event) {
    event.stopPropagation();
    doc.starred = !doc.starred;
    this.apiService.starDocument(doc.id, doc.starred).subscribe({
      next: () => {},
      error: (err) => {
        console.error(err);
      },
    });
  }
}
