import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule, NgFor } from '@angular/common';
import { TableModule } from 'primeng/table';
import { LazyLoadEvent, MessageService } from 'primeng/api';
import { DataService } from '../../services/data.service';
import { ScrollerModule } from 'primeng/scroller';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-doc-list',
  standalone: true,
  imports: [
    NgFor,
    TableModule,
    ScrollerModule,
    InfiniteScrollDirective,
    ButtonModule,
    ProgressSpinnerModule,
    CommonModule,
    ToastModule,
  ],
  templateUrl: './doc-list.component.html',
  styleUrls: ['./doc-list.component.scss'],
})
export class DocListComponent implements OnInit {
  @Input() documents: any[] = [];
  @Input() loadedAll: boolean = false;
  @Output() scroll = new EventEmitter<void>();
  @Output() documentDeleted = new EventEmitter<any[]>();

  constructor(
    private router: Router,
    private apiService: ApiService,
    private dataService: DataService,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {}

  getIcon(mimetype: string): string {
    if (mimetype.includes('image')) {
      return '../../..//public/img-icon.png';
    } else if (mimetype.includes('pdf')) {
      return '../../..//public/pdf-icon.png';
    }
    return '';
  }

  viewDocument(id: number) {
    this.router.navigate(['documents', id]);
  }

  deleteDocument(id: number, event: Event) {
    event.stopPropagation();
    this.apiService.getUserId().subscribe((userId: string | undefined) => {
      if (userId && userId !== 'Unknown UID') {
        this.apiService.deleteDocument(id, userId).subscribe({
          next: () => {
            this.documents = this.documents.filter((doc) => doc.id !== id);
            // to check if no documents are left
            this.documentDeleted.emit(this.documents);
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

  onScroll() {
    this.scroll.emit();
  }
  starDocument(doc: any, event: Event) {
    event.stopPropagation();
    doc.starred = !doc.starred;
    this.apiService.starDocument(doc.id, doc.starred).subscribe({
      next: () => {},
      error: (err) => {
        console.error(err);
      },
    });
  }
}
