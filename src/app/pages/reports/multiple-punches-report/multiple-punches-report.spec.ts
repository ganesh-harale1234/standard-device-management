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
});
