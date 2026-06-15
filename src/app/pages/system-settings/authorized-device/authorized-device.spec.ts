import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizedDevice } from './authorized-device';

describe('AuthorizedDevice', () => {
  let component: AuthorizedDevice;
  let fixture: ComponentFixture<AuthorizedDevice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorizedDevice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthorizedDevice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
