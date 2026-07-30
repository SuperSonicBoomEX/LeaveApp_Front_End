import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBoard } from './manage-board';

describe('ManageBoard', () => {
  let component: ManageBoard;
  let fixture: ComponentFixture<ManageBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageBoard],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageBoard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should include action buttons in the table configuration', () => {
    fixture.detectChanges();

    expect(component.displayedColumns).toContain('actions');

    const buttonLabels = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).map((button) => button.textContent?.trim());

    expect(buttonLabels).toContain('View');
    expect(buttonLabels).toContain('Approve');
    expect(buttonLabels).toContain('Reject');
  });
});
