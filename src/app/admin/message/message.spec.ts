import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationModuleComponent } from './message';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('CommunicationModuleComponent', () => {
  let component: CommunicationModuleComponent;
  let fixture: ComponentFixture<CommunicationModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunicationModuleComponent, FormsModule, CommonModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunicationModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});