import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.scss'],
})
export class CreditsComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/']);
  }
}
