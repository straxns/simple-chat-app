import { TestBed } from '@angular/core/testing';
import { CanMatchFn } from '@angular/router';

import { routeGuard } from './route.guard';

describe('routeGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => routeGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
