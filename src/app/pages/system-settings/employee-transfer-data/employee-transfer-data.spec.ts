import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeTransferData } from './employee-transfer-data';

describe('EmployeeTransferData', () => {
  let component: EmployeeTransferData;
  let fixture: ComponentFixture<EmployeeTransferData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeTransferData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeTransferData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
