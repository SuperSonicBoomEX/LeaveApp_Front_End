import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDetails } from './manage-details';

describe('ManageDetails', () => {
  let component: ManageDetails;
  let fixture: ComponentFixture<ManageDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
