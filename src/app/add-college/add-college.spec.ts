import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCollege } from './add-college';

describe('AddCollege', () => {
  let component: AddCollege;
  let fixture: ComponentFixture<AddCollege>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCollege]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCollege);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
