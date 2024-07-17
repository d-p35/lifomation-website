import { CommonModule, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { UploadComponent } from '../../components/upload/upload.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'header-component',
  standalone: true,
  imports: [
    AutoCompleteModule,
    FormsModule,
    CommonModule,
    RouterModule,
    UploadComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  items: any[] | undefined;
  @Input() documents: any[] = [];

  constructor(
    public auth: AuthService,
    private apiService: ApiService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.fetchDocumentsNames();
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
}
