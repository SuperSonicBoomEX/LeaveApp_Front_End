import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveDetails } from './approve-details';

describe('ApproveDetails', () => {
  let component: ApproveDetails;
  let fixture: ComponentFixture<ApproveDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(ApproveDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
