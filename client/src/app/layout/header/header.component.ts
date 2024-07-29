import { CommonModule, NgIf } from '@angular/common';
import { Component, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { UploadComponent } from '../../components/upload/upload.component';
import { ApiService } from '../../services/api.service';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { WebSocketService } from '../../services/websocket.service';
import { MessageService } from 'primeng/api';
import { DataService } from '../../services/data.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'header-component',
  standalone: true,
  imports: [
    AutoCompleteModule,
    FormsModule,
    CommonModule,
    RouterModule,
    UploadComponent,
    SearchBarComponent,
    ToastModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
  items: any[] | undefined;
  @Input() documents: any[] = [];
  dropdownOpen = false;
  private clickListener?: () => void;
  userId: string | undefined;
  constructor(
    public auth: AuthService,
    private apiService: ApiService,
    private router: Router,
    private webSocketService: WebSocketService,
    private messageService: MessageService,
    private dataService: DataService,
    private renderer: Renderer2,
  ) {}

  ngOnInit() {
    this.apiService.getUserId().subscribe((userId) => {
      this.userId = userId;
    });
    this.clickListener = this.renderer.listen(
      'document',
      'click',
      (event: Event) => {
        this.onDocumentClick(event);
      },
    );
    this.fetchDocumentsNames();
    this.webSocketService.messages$.subscribe((message) => {
      if (message && message.type === 'share') {
        this.messageService.add({
          key: 'template',
          severity: 'success',
          summary: 'Document Shared',
          detail: `${message.senderEmail} shared a document with you.`,
        });
        this.dataService.notifyOther({
          refresh: true,
          type: 'share',
        });
      } else if (
        message &&
        message.type === 'edit' &&
        this.userId === message.document.ownerId
      ) {
        this.messageService.add({
          key: 'template',
          severity: 'info',
          summary: 'Your Document was Updated',
          detail: `${message.senderEmail} edited ${message.document.document.originalname}.`,
        });
      } else if (
        message &&
        message.type === 'delete' &&
        this.userId === message.document.ownerId
      ) {
        this.messageService.add({
          key: 'template',
          severity: 'warn',
          summary: 'Your Document was Deleted',
          detail: `${message.senderEmail} deleted ${message.document.document.originalname}.`,
        });
      } else if (
        message &&
        message.type === 'add' &&
        this.userId === message.document.ownerId
      ) {
        this.messageService.add({
          key: 'template',
          severity: 'info',
          summary: 'Your Document was Updated',
          detail: `${message.senderEmail} added a new key to ${message.document.document.originalname}.`,
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.clickListener) {
      this.clickListener();
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  fetchDocumentsNames() {
    this.apiService.getDocuments().subscribe({
      next: (res) => {
        this.items = res.documents;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  viewDocument(id: number) {
    const doc = this.items?.find((doc) => doc.id === id);
    if (!doc) {
      return;
    }
    this.router.navigate(['/documents', id]);
  }

  selectedItem: any;
  suggestions: any[] = [];

  search(event: any) {
    const query = event.query ? event.query.toLowerCase() : '';
    this.suggestions = this.items
      ? this.items
          .filter(
            (item) =>
              item.document.originalname &&
              item.document.originalname.toLowerCase().includes(query),
          )
          .map((item) => ({
            label: item.document.originalname,
            id: item.id,
          }))
      : [];
  }

  onSuggestionSelect(event: any) {
    const selectedDocument = event;
    if (selectedDocument && selectedDocument.value.id) {
      this.viewDocument(selectedDocument.value.id);
    }
  }
  private onDocumentClick(event: Event): void {
    const targetElement = event.target as HTMLElement;
    const profileContainer = document.querySelector('.profile-container');
    const welcome = document.querySelector('.welcome');
    console.log('targetElement', targetElement);
    if (
      profileContainer &&
      !profileContainer.contains(targetElement) &&
      targetElement !== welcome
    ) {
      this.dropdownOpen = false;
    }
  }
}
