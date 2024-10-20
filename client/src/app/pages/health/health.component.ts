import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DataService } from '../../services/data.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DocListComponent } from '../../components/doc-list/doc-list.component';
import { WebSocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { FolderInfoComponent } from '../../folder-info/folder-info.component';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [ CommonModule,
    FormsModule,
    NgFor,
    NgIf,
    FolderInfoComponent,
    DocListComponent,],
  templateUrl: './health.component.html',
  styleUrl: './health.component.scss'
})
export class HealthComponent {
  documents: any[] = [];
  folderInfo: any[] = [];
  nextDocument: String | undefined;
  folderName: string = 'health';
  itemsPerPage: number = 10;
  totalRecords: number = 0;
  loadedAll: boolean = false;
  loading: boolean = true;
  userId: string | undefined;
  selectedTab: string = 'folder-info';

  private wsSubscription: Subscription = new Subscription();


  constructor(
    private apiService: ApiService,
    private dataService: DataService,
    private wsService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.dataService.notifyObservable$.subscribe((res) => {
      if (res && res.refresh) {
        if (
          res.document &&
          res.document.categoryName == 'Health'
        ) {
          if (res.type == 'delete') {
            this.documents = this.documents.filter(
              (doc) => doc.id !== res.document.id
            );
            if (this.documents.length === 0) {
              this.loadedAll = true; // Ensures that the message is shown
            }
          } else if (res.type == 'upload') {
            this.documents = [
              {
                ...res.document,
                uploadedAtLocal: this.convertToUserTimezone(
                  new Date(res.document.uploadedAt)
                ),
                lastOpenedLocal: this.convertToUserTimezone(
                  new Date(res.document.lastOpened)
                ),
                fileSize: this.getFileSize(res.document.document.size),
              },
              ...this.documents,
            ];
          }
        }
      }
    });

    this.fetchDocumentsByPage(this.nextDocument, this.itemsPerPage);

    this.fetchFolderInfo();
  }

  onScroll() {
    if (this.loadedAll) return;
    this.fetchDocumentsByPage(this.nextDocument, this.itemsPerPage);
  }

  fetchFolderInfo() {
    this.apiService.getFolderInfo('health').subscribe({
      next: (res) => {
        for (let key in res.folderInfo) {
          this.folderInfo.push({ key, value: res.folderInfo[key] });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  switchTab(tab: string) {
    this.selectedTab = tab;
  }

  fetchDocumentsByPage(next: String | undefined, itemsPerPage: number) {
    this.apiService
      .getDocuments(next, itemsPerPage, 'Health')
      .subscribe({
        next: (res) => {
          this.documents = this.documents.concat(
            res.documents.map((doc: any) => ({
              ...doc,
              uploadedAtLocal: this.convertToUserTimezone(
                new Date(doc.uploadedAt)
              ),
              // lastOpenedLocal: this.convertToUserTimezone(
              //   new Date(doc.lastOpened)
              // ),
              fileSize: this.getFileSize(doc.document.size),
            }))
          );
          console.log(res.documents);
          this.totalRecords = res.count;
          this.nextDocument = res.nextCursor;
          if (!this.nextDocument) {
            this.loadedAll = true;
          }
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
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

  sendMessage(message: any) {
    this.wsService.sendMessage(message);
  }

  onDocumentDeleted(updatedDocuments: any[]) {
    this.documents = updatedDocuments;
    if (this.documents.length === 0) {
      this.loadedAll = true;
    }
  }

  ngOnDestroy() {
    this.wsSubscription.unsubscribe();
    // this.wsService.closeConnection();
  }
}
