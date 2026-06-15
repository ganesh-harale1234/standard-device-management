import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDashboard } from './new-dashboard';

describe('NewDashboard', () => {
  let component: NewDashboard;
  let fixture: ComponentFixture<NewDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
