import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DocListComponent } from '../../components/doc-list/doc-list.component';
import { UploadComponent } from '../../components/upload/upload.component';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [DocListComponent, UploadComponent],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss',
})
export class DocumentsComponent {
  // documents: string[] = [];
  // constructor(private router: Router) {}
  // viewDocument(index: number) {
  //   this.router.navigate(['/view', index]);
  // }
}
