import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinGuestComponent } from './join-guest.component';

describe('JoinGuestComponent', () => {
  let component: JoinGuestComponent;
  let fixture: ComponentFixture<JoinGuestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinGuestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinGuestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
