// data.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private categories = [
    'Health',
    'Education and Career',
    'Government and Utilities',
    'Finance',
    'Family and Relationships',
    'Warranties and Memberships',
    'Social and Leisure',
    'Personal',
  ];

  public getCategories() {
    return this.categories;
  }
}
