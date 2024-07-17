// data.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private notify = new BehaviorSubject<any>(null);
  notifyObservable$ = this.notify.asObservable();

  public notifyOther(data: any) {
    if (data) {
      this.notify.next(data);
    }
  }
}
