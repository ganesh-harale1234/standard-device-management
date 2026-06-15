import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealTimeDashboard } from './real-time-dashboard';

describe('RealTimeDashboard', () => {
  let component: RealTimeDashboard;
  let fixture: ComponentFixture<RealTimeDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealTimeDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealTimeDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
