import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiplePunchesReport } from './multiple-punches-report';

describe('MultiplePunchesReport', () => {
  let component: MultiplePunchesReport;
  let fixture: ComponentFixture<MultiplePunchesReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiplePunchesReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiplePunchesReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should highlight consecutive same-status punches in yellow', () => {
    const inStatus = '14:41-IN, 14:42-IN, 14:43-OUT';
    const outStatus = '14:40-IN, 14:41-OUT, 14:41-OUT, 14:42-IN';

    expect(component.isContinuousDuplicatePunch('14:41-IN', inStatus)).toBeTrue();
    expect(component.isContinuousDuplicatePunch('14:42-IN', inStatus)).toBeTrue();
    expect(component.isContinuousDuplicatePunch('14:43-OUT', inStatus)).toBeFalse();

    expect(component.isContinuousDuplicatePunch('14:41-OUT', outStatus)).toBeTrue();
    expect(component.isContinuousDuplicatePunch('14:42-IN', outStatus)).toBeFalse();
  });
});
