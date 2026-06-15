import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildComponant } from './child-componant';

describe('ChildComponant', () => {
  let component: ChildComponant;
  let fixture: ComponentFixture<ChildComponant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildComponant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChildComponant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
