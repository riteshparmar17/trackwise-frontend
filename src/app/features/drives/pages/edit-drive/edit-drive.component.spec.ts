import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDriveComponent } from './edit-drive.component';

describe('EditDriveComponent', () => {
  let component: EditDriveComponent;
  let fixture: ComponentFixture<EditDriveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDriveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDriveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
