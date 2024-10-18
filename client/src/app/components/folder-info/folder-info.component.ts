import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-folder-info',
  standalone: true,
  imports: [CommonModule,FormsModule,NgFor,NgIf],
  templateUrl: './folder-info.component.html',
  styleUrl: './folder-info.component.scss'
})
export class FolderInfoComponent {
  keyValuePairs = [{ key: 'Name', value: 'Dhruv Patel' }, { key: 'Date of Birth', value: '2 Oct 2003' }, { key: 'Sex', value: 'Male' }];
  newKey: string = '';
  newValue: string = '';

  addPair() {
    if (this.newKey && this.newValue) {
      this.keyValuePairs.push({ key: this.newKey, value: this.newValue });
      this.newKey = '';
      this.newValue = '';
    }
  }

  removePair(index: number) {
    this.keyValuePairs.splice(index, 1);
  }
}
