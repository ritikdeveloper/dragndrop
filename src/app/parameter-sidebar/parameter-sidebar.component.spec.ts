import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterSidebarComponent } from './parameter-sidebar.component';

describe('ParameterSidebarComponent', () => {
  let component: ParameterSidebarComponent;
  let fixture: ComponentFixture<ParameterSidebarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ParameterSidebarComponent]
    });
    fixture = TestBed.createComponent(ParameterSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
