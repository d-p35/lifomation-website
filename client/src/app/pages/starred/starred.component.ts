import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DocCardComponent } from '../../doc-card/doc-card.component';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-starred',
  standalone: true,
  imports: [DocCardComponent, CommonModule],
  templateUrl: './starred.component.html',
  styleUrl: './starred.component.scss',
})
export class StarredComponent implements OnInit {
  documents: any[] = [];

  constructor(
    private router: Router,
    private apiService: ApiService,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.fetchDocuments();
    this.dataService.notifyObservable$.subscribe((res) => {
      if (res && res.refresh) {
        this.fetchDocuments();
      }
    });
  }

  fetchDocuments() {
    this.apiService.getUserId().subscribe((userId: string | undefined) => {
      if (userId && userId !== 'Unknown UID') {
        this.apiService.getStarredDocuments(userId).subscribe({
          next: (res) => {
            this.documents = res.documents;
          },
          error: (err) => {
            console.error(err);
          },
        });
      } else {
        console.error('User ID not found');
      }
    });
  }
}
