import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonTracking } from './person-tracking';

describe('PersonTracking', () => {
  let component: PersonTracking;
  let fixture: ComponentFixture<PersonTracking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonTracking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonTracking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
