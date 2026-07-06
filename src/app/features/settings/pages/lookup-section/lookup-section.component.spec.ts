import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupSectionComponent } from './lookup-section.component';

describe('LookupSectionComponent', () => {
  let component: LookupSectionComponent;
  let fixture: ComponentFixture<LookupSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
