import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-share-document-modal',
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.scss'],
})
export class ShareDocumentModalComponent {
  shareemail: string = '';
  shareAccessLevel: string = 'read';
  shareMessage: string | null = null;
  shareSuccess: boolean = true;

  @Output() closeModal = new EventEmitter<void>();

  // shareDocument() {
  //   // Implement sharing logic here
  //   this.shareMessage = 'Document shared successfully!';
  //   this.shareSuccess = true;
  // }

  close() {
    this.closeModal.emit();
  }
}
