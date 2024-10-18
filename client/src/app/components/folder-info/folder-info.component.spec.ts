import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderInfoComponent } from './folder-info.component';

describe('FolderInfoComponent', () => {
  let component: FolderInfoComponent;
  let fixture: ComponentFixture<FolderInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FolderInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FolderInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
