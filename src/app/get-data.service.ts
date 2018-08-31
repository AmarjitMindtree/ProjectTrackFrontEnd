import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as Entity from '../app/EntityClasses/ProjectTrackEntity';


@Injectable({
  providedIn: 'root'
})
export class GetDataService {

  constructor(private http: HttpClient) { }

  private URL: string = 'http://localhost:50534/api/GetTaskDetails';

  getDataFromDataBase():Observable<Entity.ProjectTrackEntity.MasterData> {
     return this.http.get<Entity.ProjectTrackEntity.MasterData>(this.URL + "/MasterData");
   }

   saveFormData(taskDetails: Entity.ProjectTrackEntity.TaskDetail): Observable<Entity.ProjectTrackEntity.ResponseFromDB>{
     return this.http.post<Entity.ProjectTrackEntity.ResponseFromDB>(this.URL + "/SaveData", taskDetails);
   }

   checkTodaysEntry(employeeId: string, date: string): Observable<Entity.ProjectTrackEntity.ResponseFromDB>{
     return this.http.get<Entity.ProjectTrackEntity.ResponseFromDB>(this.URL + "/CheckTodaysEntry?employeeId=" + employeeId + "&entryDate=" + date);
   }
}
