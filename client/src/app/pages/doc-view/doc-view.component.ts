import { CommonModule, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ImageModule } from 'primeng/image';
import { FormsModule } from '@angular/forms';
import { WebSocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-doc-view',
  standalone: true,
  imports: [
    NgIf,
    NgxExtendedPdfViewerModule,
    ImageModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './doc-view.component.html',
  styleUrl: './doc-view.component.scss',
})
export class DocViewComponent implements OnInit, OnDestroy {
  documentUrl: any = '';
  documentType: string | null = null;
  loading = true;
  keyInfo: any = null;
  document: any;
  copiedKey: string | null = null;
  editingKey: string | null = null;
  editValue: string = '';
  newKey: string = '';
  newValue: string = '';
  editDisabled: boolean = false;

  shareemail: string = '';
  shareAccessLevel: string = 'read';
  shareMessage: string | null = null;
  shareSuccess: boolean = false;
  wsSubscription: Subscription | undefined;
  userId: string | undefined;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private wsService: WebSocketService
  ) {}

  ngOnInit() {
    let index = this.route.snapshot.paramMap.get('id');
    if (!index) {
      return;
    }
    const i = parseInt(index, 10);
    this.apiService.getUserId().subscribe((userId: string | undefined) => {
      if (userId && userId !== 'Unknown UID') {
        this.userId = userId;
        this.apiService.getFile(i, userId).subscribe({
          next: (blob: Blob) => {
            this.documentType = blob.type === 'application/pdf' ? 'pdf' : null;
            const objectUrl = URL.createObjectURL(blob);
            this.documentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);

            this.apiService.getDocument(i, userId).subscribe({
              next: (res: any) => {
                this.loading = false;
                this.document = res.document;
                this.keyInfo = res.document.keyInfo;

                this.apiService.getDocumentPermissions(i, userId).subscribe({
                  next: (res: any) => {
                    if (res.permissions.accessLevel === 'read') {
                      this.editDisabled = true;
                    }
                  },
                  error: (err) => {
                    console.error(err);
                  },
                });
              },
              error: (err) => {
                console.error(err);
              },
            });
          },
          error: (err) => {
            console.error(err);
          },
        });

        this.apiService.updateLastOpened(i, userId).subscribe({
          next: () => {},
          error: (err) => {
            console.error(err);
          },
        });

        this.wsSubscription = this.wsService.messages$.subscribe((message) => {
          if (message && message.type === 'edit' && message.documentId === this.document.id) {
            this.keyInfo[message.key] = message.value;
            this.cdr.detectChanges();
          }
        });
      } else {
        console.error('User ID not found');
      }
    });
  }

  ngOnDestroy() {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

  keyInfoKeys() {
    return Object.keys(this.keyInfo);
  }

  copyToClipboard(value: string, key: string) {
    navigator.clipboard.writeText(value).then(() => {
      this.copiedKey = key;
      setTimeout(() => {
        this.copiedKey = null;
        this.cdr.detectChanges();
      }, 2000);
    });
  }

  startEdit(key: string) {
    this.editingKey = key;
    this.editValue = this.keyInfo[key];
    this.newKey = key; // Set the key for editing
  }

  saveEdit(key: string) {
    if (this.editValue !== null) {
      this.apiService.editKeyInfo(this.document.id, this.newKey, this.editValue, this.userId).subscribe({
        next: () => {
          // If the key is changed, update the key and its value
          if (this.newKey !== key) {
            delete this.keyInfo[key];
          }
          this.keyInfo[this.newKey] = this.editValue;
          this.editingKey = null;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
        },
      });
    }
  }

  cancelEdit() {
    this.editingKey = null;
    this.editValue = '';
    this.newKey = ''; // Reset new key
  }

  addKeyInfo() {
    if (this.newKey && this.newValue) {
      this.apiService.addKeyInfo(this.document.id, this.newKey, this.newValue, this.userId).subscribe({
        next: () => {
          this.keyInfo[this.newKey] = this.newValue;
          this.newKey = '';
          this.newValue = '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
        },
      });
    }
  }

  shareDocument() {
    if (!this.document || !this.shareemail || !this.shareAccessLevel) {
      return;
    }

    this.apiService.shareDocument(this.document.id, this.shareemail, this.shareAccessLevel).subscribe({
      next: () => {
        this.shareSuccess = true;
        this.shareMessage = 'Document shared successfully!';
        this.clearShareMessage();
      },
      error: (err) => {
        console.error(err);
        this.shareSuccess = false;
        this.shareMessage = 'Failed to share document: ' + (err.error?.message || err.message);
        this.clearShareMessage();
      },
    });
  }

  clearShareMessage() {
    setTimeout(() => {
      this.shareMessage = null;
      this.cdr.detectChanges();
    }, 3000);
  }
  deleteKeyInfo(key: string) {
    this.apiService.deleteKeyInfoApi(this.document.id, key, 'userId')
      .subscribe(() => {
        delete this.keyInfo[key];
      });
  }

}
