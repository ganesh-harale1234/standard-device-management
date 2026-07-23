import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogReport } from './log-report';

describe('LogReport', () => {
  let component: LogReport;
  let fixture: ComponentFixture<LogReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
