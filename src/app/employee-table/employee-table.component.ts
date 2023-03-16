import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EmployeeService } from '../employee.service';
import { Employee } from './Employee';
import { differenceInHours } from 'date-fns';
import { ChartConfiguration } from 'chart.js';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';


@Component({
  selector: 'app-employee-table',
  templateUrl: './employee-table.component.html',
  styleUrls: ['./employee-table.component.css']
})
export class EmployeeTableComponent implements OnInit {

  employees: Employee[] = [];
  chart!: Chart;
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(private employeeService: EmployeeService) { }

  ngOnInit(): void {
    Chart.register(ChartDataLabels);
    this.employeeService.getEmployees()
      .subscribe(rawEmployees => {
        const employeeMap = new Map<string, Employee>();
        for (const rawEmployee of rawEmployees) {
          if (employeeMap.has(rawEmployee.EmployeeName)) {
            
              const employee  = employeeMap.get(rawEmployee.EmployeeName);
              
              if (typeof employee !== "undefined") {
                const workingHours = this.calculateWorkingHours(rawEmployee);
                employee.totalWorkingHours += workingHours;
              }
            
          } else {
            const workingHours = this.calculateWorkingHours(rawEmployee);
            const employee: Employee = {
              Id : rawEmployee.Id,
              EmployeeName: rawEmployee.EmployeeName,
              StarTimeUtc: rawEmployee.StarTimeUtc,
              EndTimeUtc: rawEmployee.EndTimeUtc,
              EntryNotes: rawEmployee.EntryNotes,
              DeletedOn: rawEmployee.DeletedOn,
              totalWorkingHours: workingHours
            };
            employeeMap.set(rawEmployee.EmployeeName, employee);
          }
        }
        this.employees = Array.from(employeeMap.values()).filter(employee => employee.EmployeeName !== null).sort((a, b) => b.totalWorkingHours - a.totalWorkingHours);
        this.updateChart();
      });
    }
    
    ngAfterViewInit(): void {
      this.updateChart();
    }

  
  calculateWorkingHours(employee: Employee): number {
    return Math.abs(differenceInHours(
      new Date(employee.EndTimeUtc),
      new Date(employee.StarTimeUtc))
    )
  }

  calculatePercentage(employee : Employee, total : number) : number {
    const percentage = (employee.totalWorkingHours / total * 100);
    return Math.round(percentage);
  }

  private updateChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const totalHours = this.employees.reduce((acc, cur) => acc + cur.totalWorkingHours, 0);

    const data = {
      labels: this.employees.map(employee => employee.EmployeeName),
      datasets: [{
        label: 'Working hours',
        data: this.employees.map(employee => this.calculatePercentage(employee,totalHours)),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9933']
      }]
    };

    const config: ChartConfiguration = {
      type: 'pie',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            enabled: false
          },
          datalabels: {
            formatter: (value) => {
              return `${value}%`
            }
          }
          
          
        }  
      }
    }
  
    const canvas = this.chartCanvas.nativeElement;
    this.chart = new Chart(canvas, config); 
  }
}
