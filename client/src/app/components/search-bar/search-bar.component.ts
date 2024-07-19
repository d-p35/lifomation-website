import { CommonModule, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { UploadComponent } from '../../components/upload/upload.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [  AutoCompleteModule,
    FormsModule,
    CommonModule,
    RouterModule,
    UploadComponent,
    SearchBarComponent],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent {
  query: string = '';
  results: any[] = [];
  userId: string = 'sampleId'; // Replace with actual userId retrieval logic

  constructor(private apiService: ApiService, private router: Router) {}

  selectedItem: any;
  suggestions: any[] = [];

  search(event: any) {
    const query = event.query;
    if (query && this.userId) {
      this.apiService.searchDocuments(query, this.userId)
        .subscribe({
          next: (res) => {
            this.suggestions = res;
            console.log('Suggestions:', this.suggestions);
          },
          error: (err) => {
            console.error(err);
          
    }
    });
  }
}

  viewDocument(id: number) {
    const doc = this.suggestions?.find((doc) => doc.id === id);
    if (!doc) {
      return;
    }
    this.router.navigate(['/documents', id]);
  }

  onSuggestionSelect(event: any) {
    const selectedDocument = event;
    if (selectedDocument && selectedDocument.value.id) {
      this.viewDocument(selectedDocument.value.id);
    }
  }

}
