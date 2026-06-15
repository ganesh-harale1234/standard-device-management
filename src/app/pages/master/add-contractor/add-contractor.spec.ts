import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContractor } from './add-contractor';

describe('AddContractor', () => {
  let component: AddContractor;
  let fixture: ComponentFixture<AddContractor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddContractor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddContractor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
