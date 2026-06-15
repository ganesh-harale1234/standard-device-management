import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Helps } from './helps';

describe('Helps', () => {
  let component: Helps;
  let fixture: ComponentFixture<Helps>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Helps]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Helps);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
