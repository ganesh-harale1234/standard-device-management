import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogRecords } from './log-records';

describe('LogRecords', () => {
  let component: LogRecords;
  let fixture: ComponentFixture<LogRecords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogRecords]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogRecords);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
