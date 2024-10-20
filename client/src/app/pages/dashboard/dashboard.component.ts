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

    });
  }

  files = [
    {
      icon: 'pi-users',
      title: 'Family and Relationships',
      url: '/family-and-relationships',
    },
    {
      icon: 'pi-file-pdf',
      title: 'Personal',
      url: '/personal',
    },
    {
      icon: 'pi-heart',
      title: 'Health',
      url: '/health',
    },
    {
      icon: 'pi-book',
      title: 'Education and Career',
      url: '/education-and-career',
    },
    {
      icon: 'pi-building',
      title: 'Government and Utilities',
      url: '/government-and-utilities',
    },
    {
      icon: 'pi-credit-card',
      title: 'Finance',
      url: '/finance',
    },
    {
      icon: 'pi-credit-card',
      title: 'Social and Leisure',
      url: '/social-and-leisure',
    },
    {
      icon: 'pi-credit-card',
      title: 'Warranties and Memberships',
      url: '/warranties-and-memberships',
    },
  ];

  fetchDocuments() { }

  OnFolderClick(url: String) {
    this.router.navigate([url], {
     
    });
  }
}
