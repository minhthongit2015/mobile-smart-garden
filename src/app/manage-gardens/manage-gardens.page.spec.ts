import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageGardensPage } from './manage-gardens.page';

describe('ManageGardensPage', () => {
  let component: ManageGardensPage;
  let fixture: ComponentFixture<ManageGardensPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageGardensPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageGardensPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
