import { Component, OnInit } from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import swal from 'sweetalert2';

import { GetDataService } from '../get-data.service';
import * as Entity from '../EntityClasses/ProjectTrackEntity';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})

export class FormComponent implements OnInit {
  myForm: FormGroup;
  datas: Entity.ProjectTrackEntity.Project[];
  tracks: Entity.ProjectTrackEntity.Track[];
  qualitylist: Entity.ProjectTrackEntity.TaskQuality[];
  statuss: Entity.ProjectTrackEntity.TaskStatus[];
  taskDetail: Entity.ProjectTrackEntity.TaskDetail;
  responseFromDB: Entity.ProjectTrackEntity.ResponseFromDB = new Entity.ProjectTrackEntity.ResponseFromDB();
  startMinDate = new Date(2016, 0, 1);
  endMinDate;
  endMaxDate = new Date(2020, 0, 1);
  statusToHideFormFields;
  constructor(private myService: GetDataService) { }

  ngOnInit() {
    this.myForm = new FormGroup({
      employeeID: new FormControl('', Validators.compose([ Validators.required, Validators.pattern('^[M|m][1][0-9]{6}$')])),
      projects: new FormControl(null, [Validators.required]),
      tracks: new FormControl(null, [Validators.required]),
      startDate: new FormControl(null, [Validators.required]),
      endDate: new FormControl(null, [Validators.required]),
      status: new FormControl(null, [Validators.required]),
      quality: new FormControl(null, [Validators.required]),
    });
    this.myService.getDataFromDataBase()
                  .subscribe(data => {
                    this.datas = data.Projects; this.qualitylist = data.TaskQualityList;
                    this.statuss = data.TaskStatusList; });
  }

  private resetFormData() {
    this.myForm.controls['tracks'].reset();
    this.myForm.controls['projects'].reset();
    this.myForm.controls['startDate'].reset();
    this.myForm.controls['endDate'].reset();
    this.myForm.controls['status'].reset();
    this.myForm.controls['quality'].reset();
  }

  checkEmployeeIdStatus() {
    if ( this.myForm.controls['employeeID'].valid) {
      this.myService.checkTodaysEntry( this.myForm.controls['employeeID'].value, new Date().toJSON().slice(0, 10))
      .subscribe(response => {
        this.responseFromDB = {
        Message: response.Message, Status: response.Status,
        StatusCode: response.StatusCode, ResponseData: response.ResponseData };
          if (this.responseFromDB.Status === true) {
              this.statusToHideFormFields = false;
              swal({ text: 'You have already entered data for today.', type: 'error' });
          } else {
                  this.statusToHideFormFields = true;
                    if (this.responseFromDB.ResponseData == null) {
                      this.resetFormData();
                    } else {
                      let projectName;
                      let trackName;
                        for (const proj of this.datas) {
                          for (const trk of proj.ProjectTrackList) {
                            if (trk.Id === this.responseFromDB.ResponseData['ProjectTrackId']) {
                              trackName = trk.Description;
                              projectName = proj.Description;
                              break;
                            }
                          }
                        }
                        this.myForm = new FormGroup({
                          employeeID: new FormControl(
                          this.responseFromDB.ResponseData['EmployeeId'],
                            Validators.compose([ Validators.required, Validators.pattern('[M|m][1][0-9]{6}')])),
                          projects: new FormControl(projectName, [Validators.required]),
                          tracks: new FormControl(trackName, [Validators.required]),
                          startDate: new FormControl(this.responseFromDB.ResponseData['StartDate'],
                            [Validators.required]),
                          endDate: new FormControl(this.responseFromDB.ResponseData['EndDate'],
                            [Validators.required]),
                          status: new FormControl(this.statuss.
                            find(d => d.Id === this.responseFromDB.ResponseData['TaskStatusId']).Description,
                            [Validators.required]),
                          quality: new FormControl(this.qualitylist.
                            find(d => d.Id === this.responseFromDB.ResponseData['TaskQualityId']).Description,
                            [Validators.required]),
                        });
                    }
                  }
      });
    } else {
      this.statusToHideFormFields = false;
    }
  }

  selectTrack() {
    this.myForm.controls['tracks'].reset();
    this.getTrackList();
  }

  private getTrackList(): Entity.ProjectTrackEntity.Track[] {
    console.log(this.datas.find(project => project.Description === this.myForm.controls['projects'].value));
    return this.tracks = this.datas.find(project => project.Description === this.myForm.controls['projects'].value).ProjectTrackList;
  }

  setEndMinDate() {
    this.myForm.controls['endDate'].reset();
    this.endMinDate = this.myForm.controls['startDate'].value;
  }

  private fillFormDataToObject(): Entity.ProjectTrackEntity.TaskDetail {
    this.getTrackList();
    this.taskDetail = new Entity.ProjectTrackEntity.TaskDetail();
    this.taskDetail.EntryDate = new Date().toJSON().slice(0, 10);
    this.taskDetail.EmployeeId = this.myForm.controls['employeeID'].value;
    this.taskDetail.ProjectTrackId = this.tracks.find(trk => trk.Description === this.myForm.controls['tracks'].value).Id;
    this.taskDetail.StartDate = new Date(this.myForm.controls['startDate'].value).toJSON().slice(0, 10);
    this.taskDetail.EndDate = new Date(this.myForm.controls['endDate'].value).toJSON().slice(0, 10);
    this.taskDetail.TaskStatusId = this.statuss.find(st => st.Description === this.myForm.controls['status'].value).Id;
    this.taskDetail.TaskQualityId = this.qualitylist.find(qlt => qlt.Description === this.myForm.controls['quality'].value).Id;
    return this.taskDetail;
  }

  onSubmit(): boolean {
    if (this.myForm.valid) {
    const check: boolean = window.confirm('Are you sure you want to submit? Data once submitted cannot be edited.');
    if (check) {
        this.myService.saveFormData(this.fillFormDataToObject()).subscribe(data => {
          this.responseFromDB = { Message:  data.Message, Status: data.Status, StatusCode: data.StatusCode, ResponseData: null };
          if (this.responseFromDB.Status === true) {
              swal({type: 'success', text: this.responseFromDB.Message });
              this.resetFormData();
              this.statusToHideFormFields = false;
            } else {
              swal({type: 'error', text: this.responseFromDB.Message });
              this.resetFormData();
            }
          });
              return true;
          } else {
            this.myForm.enable();
            return false;
          }
  }
}
}
