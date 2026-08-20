import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CumulativeDurationReport } from './cumulative-duration-report';

describe('CumulativeDurationReport', () => {
  let component: CumulativeDurationReport;
  let fixture: ComponentFixture<CumulativeDurationReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CumulativeDurationReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CumulativeDurationReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
