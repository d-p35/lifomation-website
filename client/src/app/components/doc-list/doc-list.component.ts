import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NgFor } from '@angular/common';
import { DocCardComponent } from '../../doc-card/doc-card.component';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-doc-list',
  standalone: true,
  imports: [NgFor, DocCardComponent],
  templateUrl: './doc-list.component.html',
  styleUrl: './doc-list.component.scss',
})
export class DocListComponent implements OnInit {
  @Input() documents: any[] = [];

  constructor(private router: Router, private apiService: ApiService,  private dataService: DataService) {}

  ngOnInit() {
    this.fetchDocuments();
    this.dataService.notifyObservable$.subscribe(res => {
      if (res && res.refresh) {
        this.fetchDocuments();
      }
    });
  }

  fetchDocuments() {
    this.apiService.getDocuments().subscribe({
      next: (res) => {
        this.documents = res.documents;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  addDocument(document: any) {
    this.documents.push(document);
  }

  viewDocument(id: number) {
    const doc = this.documents.find((doc) => doc.id === id);
    if (!doc) {
      return;
    }
    this.router.navigate(['/documents', id]);
  }

  deleteDocument(id: number) {
    this.apiService.deleteDocument(id).subscribe({
      next: (res) => {
        this.documents = this.documents.filter((doc) => doc.id !== id);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
