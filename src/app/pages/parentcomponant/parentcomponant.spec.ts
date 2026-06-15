import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Parentcomponant } from './parentcomponant';

describe('Parentcomponant', () => {
  let component: Parentcomponant;
  let fixture: ComponentFixture<Parentcomponant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Parentcomponant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Parentcomponant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
