import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkingHours } from './working-hours';

describe('WorkingHours', () => {
  let component: WorkingHours;
  let fixture: ComponentFixture<WorkingHours>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkingHours]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkingHours);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
