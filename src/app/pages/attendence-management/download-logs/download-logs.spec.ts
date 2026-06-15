import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadLogs } from './download-logs';

describe('DownloadLogs', () => {
  let component: DownloadLogs;
  let fixture: ComponentFixture<DownloadLogs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadLogs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownloadLogs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
