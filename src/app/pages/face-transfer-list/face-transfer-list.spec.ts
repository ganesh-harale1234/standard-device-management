import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceTransferList } from './face-transfer-list';

describe('FaceTransferList', () => {
  let component: FaceTransferList;
  let fixture: ComponentFixture<FaceTransferList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaceTransferList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaceTransferList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
