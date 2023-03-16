import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Employee } from './employee-table/Employee';

@Injectable({
  providedIn: 'root'
})
//provjeriti da li treba async
export class EmployeeService {
  private apiUrl =  'https://rc-vault-fap-live-1.azurewebsites.net/api/gettimeentries?code=vO17RnE8vuzXzPJo5eaLLjXjmRW07law99QTD90zat9FfOQJKKUcgQ==';
  constructor(private http : HttpClient) { }
  getEmployees() : Observable<Employee[]> {
    return this.http.get<any>(this.apiUrl);
  }
}
