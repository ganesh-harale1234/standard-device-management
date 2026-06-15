import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessGrantedReport } from './access-granted-report';

describe('AccessGrantedReport', () => {
  let component: AccessGrantedReport;
  let fixture: ComponentFixture<AccessGrantedReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessGrantedReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessGrantedReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
