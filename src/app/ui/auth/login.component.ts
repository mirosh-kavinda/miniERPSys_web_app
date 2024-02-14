import { Component, OnInit } from '@angular/core';
import { moveIn, fallIn } from '../../shared/router.animations';
import { environment } from '../../../environments/environment';
import { BackendService } from '../../services/backend.service';
import { DBInBoundData, DBOutBoundData } from '../../services/datamodel';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [moveIn(), fallIn()],
  host: { '[@fallIn]': '' }
})
export class LoginComponent implements OnInit {

  showPage: boolean = true;
  showFiller: boolean = true;
  socialAuth: boolean = false; // show Google and FB Sign in only when social auth is enabled
  state: string = ''; // required for router animation
  dataLoading: boolean = false; // spinner booleana
  IBData: DBInBoundData; // inbound data
  OBData: DBOutBoundData; // outbound data

  constructor(public auth: AngularFireAuth, private _backendService: BackendService,private router: Router) { }

  ngOnInit() {
    if (environment.socialAuthEnabled) {
      this.socialAuth = true; // show Google and FB Sign in only when social auth is enabled
    }
    this.IBData = {
      error: false,
      statusCode: 0, // 0 initial, 1 saved, 2 others
      statusMessage: "", // error or success message from server
      rowCount: 0, // number of rows returned
      data: "" // actual data
    } // inbound data
    this.OBData = {
      rowCount: 1,
      recordType: "login",
      data: ""
    }; // outbound data
  }

  loginEmail(formData) {
    this.dataLoading = true;
    this.OBData.data = formData;
    return this._backendService.loginEmail(this.OBData).then(res => {
      this.IBData.error = false;
      this.IBData.statusCode = 1;
    }).catch(error => {
      this.IBData.error = true;
      this.IBData.statusCode = 0;
      this.IBData.statusMessage = error;
    }).finally(() => {
      this.dataLoading = false;
    })
    .then(() => {
      this.router.navigateByUrl('/home');
    });
}
  loginSocial(formType) {
    this.dataLoading = true;
    return this._backendService.loginSocialAuth(formType)
      .then(res => {
        this.IBData.error = false;
        this.IBData.statusCode = 1;
      })
      .catch(error => {
        this.IBData.error = true;
        this.IBData.statusCode = 0;
        this.IBData.statusMessage = error;
        throw error; // Re-throwing error to propagate it to the next catch block if any
      })
      .finally(() => {
        this.dataLoading = false;
      })
      .then(() => {
        this.router.navigateByUrl('/home');
      });
  }
  
  logout() {
    this.auth.signOut();
  }
}
