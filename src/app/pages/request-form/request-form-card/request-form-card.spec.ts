import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestFormCard } from './request-form-card';

describe('RequestFormCard', () => {
  let component: RequestFormCard;
  let fixture: ComponentFixture<RequestFormCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestFormCard],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestFormCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
