import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-doc-view',
  standalone: true,
  imports: [NgIf, NgxExtendedPdfViewerModule, ImageModule],
  templateUrl: './doc-view.component.html',
  styleUrl: './doc-view.component.scss',
})
export class DocViewComponent {
  documentUrl: any = '';
  documentType: string | null = null;
  loading = true;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    let index = this.route.snapshot.paramMap.get('id');
    if (!index) {
      return;
    }
    const i = parseInt(index, 10);
    this.apiService.getFile(i).subscribe({
      next: (blob: Blob) => {
        this.documentType = blob.type === 'application/pdf' ? 'pdf' : null;
        const objectUrl = URL.createObjectURL(blob);
        this.documentUrl =
          this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
      },
    });

    this.apiService.updateLastOpened(i).subscribe({
      next: () => {},
      error: (err) => {
        console.error(err);
      },
    });
  }
}
