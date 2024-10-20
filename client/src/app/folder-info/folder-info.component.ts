import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-folder-info',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, NgIf],
  templateUrl: './folder-info.component.html',
  styleUrl: './folder-info.component.scss',
})
export class FolderInfoComponent {
  @Input() folderInfo: any[] = [];
  @Input() folderName: string = '';
  newKey: string = '';
  newValue: string = '';

  constructor(private apiService: ApiService) {}

  addPair() {
    if (this.newKey && this.newValue) {
      this.folderInfo.push({ key: this.newKey, value: this.newValue });
      const key = this.newKey;
      const value = this.newValue;
      this.newKey = '';
      this.newValue = '';
      this.apiService.addFolderInfo(this.folderName, key, value).subscribe({
        next: (res) => {},
        error: (err) => {
          console.error(err);
        },
      });
    }
  }

  removePair(index: number) {
    this.folderInfo.splice(index, 1);
    //TODO: Remove from database
  }
}
