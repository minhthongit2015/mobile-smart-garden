import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GardenPage } from './garden.page';

describe('GardenPage', () => {
  let component: GardenPage;
  let fixture: ComponentFixture<GardenPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GardenPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GardenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
