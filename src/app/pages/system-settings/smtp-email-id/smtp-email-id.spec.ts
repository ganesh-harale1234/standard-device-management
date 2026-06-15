import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmtpEmailId } from './smtp-email-id';

describe('SmtpEmailId', () => {
  let component: SmtpEmailId;
  let fixture: ComponentFixture<SmtpEmailId>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmtpEmailId]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmtpEmailId);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
