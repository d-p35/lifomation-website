import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DocCardComponent } from '../../doc-card/doc-card.component';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-recent',
  standalone: true,
  imports: [DocCardComponent, CommonModule],
  templateUrl: './recent.component.html',
  styleUrl: './recent.component.scss'
})
export class RecentComponent implements OnInit{
  documents: any[] = [];

  constructor(private router: Router, private apiService: ApiService, private dataService: DataService) {}

  ngOnInit() {
    this.fetchDocuments();
    this.dataService.notifyObservable$.subscribe(res => {
      if (res && res.refresh) {
        this.fetchDocuments();
      }
    });
  }

  fetchDocuments() {
    this.apiService.getRecentDocuments().subscribe({
      next: (res) => {
        this.documents = res.documents;
        console.log(this.documents);
        
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

}


