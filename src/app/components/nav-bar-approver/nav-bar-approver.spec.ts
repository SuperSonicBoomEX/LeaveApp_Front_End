import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavBarApprover } from './nav-bar-approver';

describe('NavBar', () => {
  let component: NavBarApprover;
  let fixture: ComponentFixture<NavBarApprover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavBarApprover],
    }).compileComponents();

    fixture = TestBed.createComponent(NavBarApprover);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
