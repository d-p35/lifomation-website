import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovernmentUtilitiesComponent } from './government-utilities.component';

describe('GovernmentUtilitiesComponent', () => {
  let component: GovernmentUtilitiesComponent;
  let fixture: ComponentFixture<GovernmentUtilitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovernmentUtilitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GovernmentUtilitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
