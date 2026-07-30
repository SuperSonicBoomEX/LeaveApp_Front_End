import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Approver } from './approver';

describe('Approver', () => {
  let component: Approver;
  let fixture: ComponentFixture<Approver>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Approver],
    }).compileComponents();

    fixture = TestBed.createComponent(Approver);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
