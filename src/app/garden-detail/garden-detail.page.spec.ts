import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GardenDetailPage } from './garden-detail.page';

describe('GardenDetailPage', () => {
  let component: GardenDetailPage;
  let fixture: ComponentFixture<GardenDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GardenDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GardenDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
