import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditReport } from './audit-report';

describe('AuditReport', () => {
  let component: AuditReport;
  let fixture: ComponentFixture<AuditReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
