import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { ApiService } from '../../services/api.service';
import { DocCardComponent } from '../../doc-card/doc-card.component';
import { DataService } from '../../services/data.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, CommonModule, SidebarComponent, DocCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  // Inject the authentication service into your component through the constructor
  constructor(public auth: AuthService, private router: Router, private apiService: ApiService,  private dataService: DataService) {}

  documents = [];

  ngOnInit() {
    this.fetchDocuments();
    this.dataService.notifyObservable$.subscribe(res => {
      if (res && res.refresh) {
        this.fetchDocuments();
      }
    });
  }

  files = [
    {
      icon: 'pi-users',
      title: 'Family',
      date: 'Sep 25, 2022',
      sharedUsers: 80,
      insideFiles: 3985,
    },
    {
      icon: 'pi-file-pdf',
      title: 'Personal',
      date: 'Sep 25, 2022',
      sharedUsers: 5,
      insideFiles: 499,
      
    },
    {
      icon: 'pi-heart',
      title: 'Health',
      date: 'Sep 25, 2022',
      sharedUsers: 3,
      insideFiles: 256,
    },
    {
      icon: 'pi-book',
      title: 'Education',
      date: 'Sep 25, 2022',
      sharedUsers: 52,
      insideFiles: 1225,
    },
    {
      icon: 'pi-building',
      title: 'Government Utilities',
      date: 'Sep 25, 2022',
      sharedUsers: 22,
      insideFiles: 2265,
    },
    {
      icon: 'pi-credit-card',
      title: 'Finance & Insurance',
      date: 'Sep 25, 2022',
      sharedUsers: 12,
      insideFiles: 597,
    },
  ];

  suggestions = [
    {
      icon: '../../..//public/doc-icon.png',
      title: 'Driver License.doc',
      sharedUsers: 12,
      size: '2.8 MB',
      lastModified: 'Dec 13, 2022',
    },
    {
      icon: '../../..//public/doc-icon.png',
      title: 'Tax2020.pdf',
      sharedUsers: 5,
      size: '242 MB',
      lastModified: 'Dec 12, 2022',
    },
    {
      icon: '../../..//public/pdf-icon.png',
      title: 'dsfd.png',
      sharedUsers: 0,
      size: '1.8 MB',
      lastModified: 'Dec 12, 2022',
    },
  ];

  recentFiles = [
    { icon: '../../..//public/doc-icon.png' },
    { icon: '../../..//public/doc-icon.png' },
    { icon: '../../..//public/doc-icon.png' },
    { icon: '../../..//public/pdf-icon.png' },
    { icon: '../../..//public/pdf-icon.png' },
    { icon: '../../..//public/doc-icon.png' },
    { icon: '../../..//public/pdf-icon.png' },
    { icon: '../../..//public/doc-icon.png' },
    { icon: '../../..//public/pdf-icon.png' },
  ];

  fetchDocuments() {
    this.apiService.getUserId().subscribe((userId: string | undefined) => {
      if (userId && userId !== 'Unknown UID') {
        this.apiService.getRecentDocuments(userId).subscribe({
          next: (res) => {
            this.documents = res.documents;
            if (this.documents.length > 3) this.documents = this.documents.slice(0, 3);
          },
          error: (err) => {
            console.error(err);
          }
        });
      }

      else {
        console.error('User ID not found');
      }}
    );
    
  }

  OnFolderClick() {
    this.router.navigate(['/documents']);
  }
}
