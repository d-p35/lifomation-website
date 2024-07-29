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
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-doc-view',
  standalone: true,
  imports: [
    NgIf,
    NgxExtendedPdfViewerModule,
    ImageModule,
    CommonModule,
    FormsModule,
    ToastModule,
    DialogModule,
  ],
  templateUrl: './doc-view.component.html',
  styleUrl: './doc-view.component.scss',
})
export class DocViewComponent implements OnInit {
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
  displayAddKeyInfoModal: boolean = false;
  displayShareDocumentModal: boolean = false;
  shareemail: string = '';
  shareAccessLevel: string = 'read';
  shareMessage: string | null = null;
  shareSuccess: boolean = false;
  wsSubscription: Subscription | undefined;
  userId: string | undefined;
  oldKey: string | undefined;
  oldValue: string | undefined;
  userEmail: string | undefined;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private wsService: WebSocketService,
    private messageService : MessageService
  ) {}

  ngOnInit() {
    let index = this.route.snapshot.paramMap.get('id');
    if (!index) {
      return;
    }
    this.apiService.getUserEmail().subscribe((email: string | undefined) => {
      this.userEmail = email;
    });
    const i = parseInt(index, 10);
    this.apiService.getUserId().subscribe((userId: string | undefined) => {
      if (userId && userId !== 'Unknown UID') {
        this.userId = userId;
        this.apiService.getFile(i, userId).subscribe({
          next: (blob: Blob) => {
            this.documentType = blob.type === 'application/pdf' ? 'pdf' : null;
            const objectUrl = URL.createObjectURL(blob);
            this.documentUrl =
              this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);

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
          if (
            message &&
            message.type === 'edit' &&
            message.document.id === this.document.id
          ) {
            if (message.key!==message.originalKey){delete this.keyInfo[message.originalKey];}
            this.keyInfo[message.key] = message.value;
            this.cdr.detectChanges();
            if (this.userId !== message.document.ownerId) {
            this.messageService.add({key: 'template', severity:'info', summary:'Current Document was Updated', detail: `Key: ${message.key} updated to ${message.value}`});
            }
        }
        

          if (message && message.type === 'delete' && message.document.id === this.document.id) {
            delete this.keyInfo[message.key];
            this.cdr.detectChanges();
            if (this.userId !== message.document.ownerId) {
              this.messageService.add({key: 'template', severity:'info', summary:'Current Document was Updated', detail: `Key: ${message.key} deleted`});
            }
          }

          if (message && message.type === 'add' && message.document.id === this.document.id) {
            this.keyInfo[message.key] = message.value;
            this.cdr.detectChanges();
            if (this.userId !== message.document.ownerId) {
              this.messageService.add({key: 'template', severity:'info', summary:'Current Document was Updated', detail: `Key: ${message.key} added with value ${message.value}`});
            }
          
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
    this.newValue = this.keyInfo[key];
    this.newKey = key; // Set the key for editing
  }

  saveEdit(key: string) {
    if (this.editValue !== null) {
      
      this.apiService
        .editKeyInfo(this.document.id, this.newKey, this.newValue, this.userId, this.editValue, this.editingKey)
        .subscribe({
          next: () => {
            // If the key is changed, update the key and its value
            if (this.newKey !== key) {
              delete this.keyInfo[key];
            }
            this.keyInfo[this.newKey] = this.newValue;
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
      this.apiService
        .addKeyInfo(this.document.id, this.newKey, this.newValue, this.userId)
        .subscribe({
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
    this.displayAddKeyInfoModal = false;
  }

  shareDocument() {
    if (!this.document || !this.shareemail || !this.shareAccessLevel) {
      return;
    }
    const lowerCaseEmail = this.shareemail.toLowerCase();

    this.apiService
      .shareDocument(this.document.id, lowerCaseEmail, this.userEmail, this.shareAccessLevel)
      .subscribe({
        next: () => {
          this.shareSuccess = true;
          this.shareMessage = 'Document shared successfully!';
          this.clearShareMessage();
          this.displayShareDocumentModal = false;
        },
        error: (err) => {
          console.error(err);
          this.shareSuccess = false;
          this.shareMessage =
            'Failed to share document: ' + (err.error?.message || err.message);
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
    this.apiService.deleteKeyInfoApi(this.document.id, key, this.userId)
      .subscribe(() => {
        delete this.keyInfo[key];
      });
  }
}
