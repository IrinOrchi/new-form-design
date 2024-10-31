import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeforeLoginNidComponent } from './before-login-nid.component';

describe('BeforeLoginNidComponent', () => {
  let component: BeforeLoginNidComponent;
  let fixture: ComponentFixture<BeforeLoginNidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeforeLoginNidComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeforeLoginNidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
