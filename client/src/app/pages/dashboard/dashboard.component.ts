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
  constructor(
    public auth: AuthService,
    private router: Router,
    private apiService: ApiService,
    private dataService: DataService,
  ) {}

  documents = [];

  ngOnInit() {
    this.fetchDocuments();
    this.dataService.notifyObservable$.subscribe((res) => {
      if (res && res.refresh) {
        this.fetchDocuments();
      }

      this.apiService.getUsers().subscribe((userId: string | undefined) => {
        console.log(userId);
      })
    });
  }

  files = [
    // {
    //   icon: 'pi-users',
    //   title: 'Family and Relationships',
    // },
    // {
    //   icon: 'pi-file-pdf',
    //   title: 'Personal',
    // },
    {
      icon: 'pi-heart',
      title: 'Health',
      url: '/health',
    },
    // {
    //   icon: 'pi-book',
    //   title: 'Education and Career',
    // },
    {
      icon: 'pi-building',
      title: 'Government and Utilities',
      url: '/government-and-utilities',
    },
    // {
    //   icon: 'pi-credit-card',
    //   title: 'Finance',
    // },
    // {
    //   icon: 'pi-credit-card',
    //   title: 'Social and Leisure',
    // },
    // {
    //   icon: 'pi-credit-card',
    //   title: 'Warranties and Memberships',
    // },
  ];

  suggestions = [
    {
      icon: '/doc-icon.png',
      title: 'Driver License.doc',
      sharedUsers: 12,
      size: '2.8 MB',
      lastModified: 'Dec 13, 2022',
    },
    {
      icon: '/doc-icon.png',
      title: 'Tax2020.pdf',
      sharedUsers: 5,
      size: '242 MB',
      lastModified: 'Dec 12, 2022',
    },
    {
      icon: '/pdf-icon.png',
      title: 'dsfd.png',
      sharedUsers: 0,
      size: '1.8 MB',
      lastModified: 'Dec 12, 2022',
    },
  ];

  recentFiles = [
    { icon: '/doc-icon.png' },
    { icon: '/doc-icon.png' },
    { icon: '/doc-icon.png' },
    { icon: '/pdf-icon.png' },
    { icon: '/pdf-icon.png' },
    { icon: '/doc-icon.png' },
    { icon: '/pdf-icon.png' },
    { icon: '/doc-icon.png' },
    { icon: '/pdf-icon.png' },
  ];

  fetchDocuments() { }

  OnFolderClick(url: String) {
    this.router.navigate([url], {
     
    });
  }
}
