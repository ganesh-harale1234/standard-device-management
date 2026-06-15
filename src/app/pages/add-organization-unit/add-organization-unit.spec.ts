import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrganizationUnit } from './add-organization-unit';

describe('AddOrganizationUnit', () => {
  let component: AddOrganizationUnit;
  let fixture: ComponentFixture<AddOrganizationUnit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOrganizationUnit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOrganizationUnit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
