import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DataService } from '../../services/data.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule, NgFor } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DocListComponent } from '../../components/doc-list/doc-list.component';
import { WebSocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-documents',
  standalone: true,
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  imports: [
    NgFor,
    TableModule,
    ButtonModule,
    ProgressSpinnerModule,
    CommonModule,
    ToastModule,
    DocListComponent,
  ],
})
export class DocumentsComponent implements OnInit, OnDestroy {
  documents: any[] = [];
  folderName: string = 'My Documents';
  nextDocument: String | undefined;
  itemsPerPage: number = 10;
  totalRecords: number = 0;
  loadedAll: boolean = false;
  loading: boolean = true;
  userId: string | undefined;

  private wsSubscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private dataService: DataService,
    private wsService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.loading = true;
      this.folderName = params['folder'] ? params['folder'] : 'My Documents';
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
            userId
          );
        } else {
          console.error('User ID not found');
        }
      });
    });

    this.dataService.notifyObservable$.subscribe((res) => {
      if (res && res.refresh) {
        if (
          res.document &&
          (res.document.category.split(',')[0] == this.folderName ||
            this.folderName == 'My Documents')
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

    // this.wsSubscription = this.wsService.getMessages().subscribe((message) => {
    //   console.log('Received message:', message);
    //   //@d-p35 TODO
    // });
  }

  onScroll() {
    if (!this.userId || this.loadedAll) return;
    this.fetchDocumentsByPage(
      this.nextDocument,
      this.itemsPerPage,
      this.userId
    );
  }

  fetchDocumentsByPage(
    next: String | undefined,
    itemsPerPage: number,
    userId: string
  ) {
    this.apiService
      .getDocuments(
        next,
        itemsPerPage,
        userId,
        this.folderName == 'My Documents' ? undefined : this.folderName
      )
      .subscribe({
        next: (res) => {
          this.documents = this.documents.concat(
            res.documents.map((doc: any) => ({
              ...doc,
              uploadedAtLocal: this.convertToUserTimezone(
                new Date(doc.uploadedAt)
              ),
              lastOpenedLocal: this.convertToUserTimezone(
                new Date(doc.lastOpened)
              ),
              fileSize: this.getFileSize(doc.document.size),
            }))
          );
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
