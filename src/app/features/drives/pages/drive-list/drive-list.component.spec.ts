import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriveListComponent } from './drive-list.component';

describe('DriveListComponent', () => {
  let component: DriveListComponent;
  let fixture: ComponentFixture<DriveListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriveListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriveListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
