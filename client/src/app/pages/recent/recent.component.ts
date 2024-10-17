import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { DataService } from '../../services/data.service';
import { DocListComponent } from '../../components/doc-list/doc-list.component';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-recent',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule, DocListComponent],
  templateUrl: './recent.component.html',
  styleUrls: ['./recent.component.scss'],
})
export class RecentComponent implements OnInit {
  documents: any[] = [];
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
        this.fetchDocumentsByPage(this.nextDocument, this.itemsPerPage, userId);
      } else {
        console.error('User ID not found');
      }
    });

    this.dataService.notifyObservable$.subscribe((res) => {
      if (res && res.refresh && res.document) {
        if (res.type == 'delete') {
          this.documents = this.documents.filter(
            (doc) => doc.id !== res.document.id,
          );
          this.onDocumentDeleted(this.documents); // Check if no documents left
        } else if (res.type == 'upload') {
          this.documents = [
            {
              ...res.document,
              uploadedAtLocal: this.convertToUserTimezone(
                new Date(res.document.uploadedAt),
              ),
              lastOpenedLocal: this.convertToUserTimezone(
                new Date(res.document.lastOpened),
              ),
              fileSize: this.getFileSize(res.document.document.size),
            },
            ...this.documents,
          ];
        }
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
  ) {}

  onDocumentDeleted(updatedDocuments: any[]) {
    this.documents = updatedDocuments;
    if (this.documents.length === 0) {
      this.loadedAll = true;
    }
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
