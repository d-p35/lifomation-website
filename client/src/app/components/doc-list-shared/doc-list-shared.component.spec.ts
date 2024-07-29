import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocListSharedComponent } from './doc-list-shared.component';

describe('DocListSharedComponent', () => {
  let component: DocListSharedComponent;
  let fixture: ComponentFixture<DocListSharedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocListSharedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DocListSharedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
