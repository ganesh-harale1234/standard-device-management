import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonTrackingReport } from './person-tracking-report';

describe('PersonTrackingReport', () => {
  let component: PersonTrackingReport;
  let fixture: ComponentFixture<PersonTrackingReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonTrackingReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonTrackingReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
