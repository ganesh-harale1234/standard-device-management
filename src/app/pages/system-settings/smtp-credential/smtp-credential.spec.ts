import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmtpCredential } from './smtp-credential';

describe('SmtpCredential', () => {
  let component: SmtpCredential;
  let fixture: ComponentFixture<SmtpCredential>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmtpCredential]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmtpCredential);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
