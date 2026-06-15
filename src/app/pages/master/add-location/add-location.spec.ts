import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLocation } from './add-location';

describe('AddLocation', () => {
  let component: AddLocation;
  let fixture: ComponentFixture<AddLocation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddLocation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddLocation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
