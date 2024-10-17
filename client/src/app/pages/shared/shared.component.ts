import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DocCardComponent } from '../../doc-card/doc-card.component';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DocListSharedComponent } from '../../components/doc-list-shared/doc-list-shared.component';

@Component({
  selector: 'app-shared',
  standalone: true,
  imports: [
    DocCardComponent,
    CommonModule,
    ProgressSpinnerModule,
    DocListSharedComponent,
  ],
  templateUrl: './shared.component.html',
  styleUrl: './shared.component.scss',
})
export class SharedComponent implements OnInit {
  documents: any[] = [];
  folderName: string = 'My Documents';
  nextDocument: String | undefined;
  itemsPerPage: number = 10;
  totalRecords: number = 0;
  loadedAll: boolean = false;
  loading: boolean = true;
  userId: string | undefined;

  constructor(
    private apiService: ApiService,
    private dataService: DataService,
  ) {}
  ngOnInit(): void {
    this.apiService.getUserId().subscribe((userId: string | undefined) => {
      if (userId && userId !== 'Unknown UID') {
        this.userId = userId;
        this.nextDocument = undefined;
        this.loadedAll = false;
        this.documents = [];
        this.totalRecords = 0;
        this.fetchDocumentsByPage(
          this.nextDocument,
          this.itemsPerPage,
          userId ? userId : '',
        );
      } else {
        console.error('User ID not found');
      }
    });

    this.dataService.notifyObservable$.subscribe((res) => {
      if (res && res.refresh && res.type === 'share') {
        this.nextDocument = undefined;
        this.loadedAll = false;
        this.documents = [];
        this.totalRecords = 0;
        this.fetchDocumentsByPage(
          this.nextDocument,
          this.itemsPerPage,
          this.userId ? this.userId : '',
        );
      } else {
      }
    });
  }

  onScroll() {
    if (!this.userId || this.loadedAll) return;
    this.fetchDocumentsByPage(
      this.nextDocument,
      this.itemsPerPage,
      this.userId,
    );
  }

  fetchDocumentsByPage(
    next: String | undefined,
    itemsPerPage: number,
    userId: string,
  ) {
  }

  convertToUserTimezone(date: Date): string {
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000,
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
