import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessControlReport } from './access-control-report';

describe('AccessControlReport', () => {
  let component: AccessControlReport;
  let fixture: ComponentFixture<AccessControlReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessControlReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessControlReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
