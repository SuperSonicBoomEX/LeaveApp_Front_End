import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../../services/auth-service';
import { EmployeesService } from '../../services/employees-service';
import { NavBar } from './nav-bar';

describe('NavBar', () => {
  let component: NavBar;
  let fixture: ComponentFixture<NavBar>;
  let authServiceStub: { getUserId: ReturnType<typeof vi.fn>; getUsername: ReturnType<typeof vi.fn> };
  let employeeServiceStub: { getEmployee: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authServiceStub = {
      getUserId: vi.fn(() => 7),
      getUsername: vi.fn(() => 'jdoe'),
    };
    employeeServiceStub = {
      getEmployee: vi.fn(() => of({ id: 7, name: 'Jane Doe' })),
    };

    await TestBed.configureTestingModule({
      imports: [NavBar],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: EmployeesService, useValue: employeeServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the employee name from the employees API', () => {
    expect(component.username).toBe('Jane Doe');
    expect(employeeServiceStub.getEmployee).toHaveBeenCalledWith(7);
  });
});
