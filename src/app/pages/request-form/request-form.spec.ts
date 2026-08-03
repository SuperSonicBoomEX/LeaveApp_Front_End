// @vitest-environment jsdom

import '@angular/compiler';
import { beforeEach, describe, expect, it } from 'vitest';

import { RequestForm } from './request-form';

describe('RequestForm', () => {
  let component: RequestForm;

  beforeEach(() => {
    component = new RequestForm();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be an instance of RequestForm', () => {
    expect(component).toBeInstanceOf(RequestForm);
  });
});