import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorWiseReport } from './contractor-wise-report';

describe('ContractorWiseReport', () => {
  let component: ContractorWiseReport;
  let fixture: ComponentFixture<ContractorWiseReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractorWiseReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractorWiseReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
