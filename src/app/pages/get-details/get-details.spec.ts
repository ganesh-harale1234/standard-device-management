import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetDetails } from './get-details';

describe('GetDetails', () => {
  let component: GetDetails;
  let fixture: ComponentFixture<GetDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
