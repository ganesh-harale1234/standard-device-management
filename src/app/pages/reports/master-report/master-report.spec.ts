import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterReport } from './master-report';

describe('MasterReport', () => {
  let component: MasterReport;
  let fixture: ComponentFixture<MasterReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
