import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedidorDashboardPage } from './medidor-dashboard.page';

describe('MedidorDashboardPage', () => {
  let component: MedidorDashboardPage;
  let fixture: ComponentFixture<MedidorDashboardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MedidorDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
