import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntryExitStatusReport } from './entry-exit-status-report';

describe('EntryExitStatusReport', () => {
  let component: EntryExitStatusReport;
  let fixture: ComponentFixture<EntryExitStatusReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntryExitStatusReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntryExitStatusReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
