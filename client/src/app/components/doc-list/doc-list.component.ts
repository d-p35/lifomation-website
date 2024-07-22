import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NgFor } from '@angular/common';
import { TableModule } from 'primeng/table';
import { LazyLoadEvent } from 'primeng/api';
import { DataService } from '../../services/data.service';
import { ScrollerModule } from 'primeng/scroller';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-doc-list',
  standalone: true,
  imports: [NgFor, TableModule, ScrollerModule, InfiniteScrollDirective, ButtonModule],
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
  items: any[] = [];

  constructor(
    private router: Router,
    private apiService: ApiService,
    private dataService: DataService,
    private route: ActivatedRoute
  ) {}

  loadItems() {
    for (let i = 1; i <= 20; i++) {
      this.items.push(`Item #${this.items.length + 1}`);
    }
  }
  onScroll() {
    console.log('scrolled!!');
    this.fetchDocumentsByPage(this.currentPage+1, this.itemsPerPage);
  }

  ngOnInit() {
    this.loadItems();
    this.route.queryParams.subscribe((params) => {
      this.folderName = params['folder'];
      console.log('Folder Name:', this.folderName);
    });
    this.fetchDocuments();
    this.dataService.notifyObservable$.subscribe((res) => {
      if (res && res.refresh) {
        this.fetchDocuments();
      }
    });
  }

  fetchDocumentsByPage(page: number, itemsPerPage: number, userId?: string) {
    this.apiService.getDocuments(page, itemsPerPage, userId, this.folderName).subscribe({
      next: (res) => {
        this.documents = this.documents.concat(res.documents.map((doc: any) => ({
          ...doc,
          uploadedAtLocal: this.convertToUserTimezone(new Date(doc.uploadedAt)),
          lastOpenedLocal: this.convertToUserTimezone(new Date(doc.lastOpened)),
          fileSize: this.getFileSize(doc.document.size),
        })));
        this.totalRecords = res.totalRecords;
        this.currentPage = page;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  fetchDocuments() {
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
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
