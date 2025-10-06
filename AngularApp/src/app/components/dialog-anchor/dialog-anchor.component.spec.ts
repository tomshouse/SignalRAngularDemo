import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAnchorComponent } from './dialog-anchor.component';

describe('DialogAnchorComponent', () => {
  let component: DialogAnchorComponent;
  let fixture: ComponentFixture<DialogAnchorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogAnchorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogAnchorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
