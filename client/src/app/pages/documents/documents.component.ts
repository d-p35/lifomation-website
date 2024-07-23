import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocListComponent } from '../../components/doc-list/doc-list.component';
import { UploadComponent } from '../../components/upload/upload.component';


@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [DocListComponent, UploadComponent],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss',
})
export class DocumentsComponent implements OnInit {

  constructor( private route: ActivatedRoute, ) { }

  folderName: String | undefined;
  ngOnInit(): void {
    this.route.queryParams.subscribe((params: { [x: string]: String | undefined; }) => {
      this.folderName = params['folder']? params['folder'] : "My Documents";

    });
  }
}
