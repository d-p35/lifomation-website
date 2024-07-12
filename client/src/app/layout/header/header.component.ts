import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { UploadComponent } from '../../components/upload/upload.component';


@Component({
  selector: 'header-component',
  standalone: true,
  imports: [AutoCompleteModule, FormsModule, CommonModule, RouterModule,UploadComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  items: any[] | undefined;

  constructor(public auth : AuthService) {}
  selectedItem: any;

  suggestions: any[] =[];

  search(event: any) {
      this.suggestions = [...Array(10).keys()].map(item => event.query + '-' + item);
  }
}
