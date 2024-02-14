import { Component, OnInit, Input } from '@angular/core';
import { BackendService } from '../services/backend.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() imageUrl: string;
  @Input() pageTitle: string;
  @Input() helpType: string;
  configData;
  authState: any = null;
  data$;

  constructor(public afAuth: AngularFireAuth, private _backendService: BackendService, private _router: Router) { }

  ngOnInit(): void {
    this.configData = this._backendService.getConfig("helptext");
    this.afAuth.authState.subscribe(authState => {
      this.authState = authState;
      this.getUserDoc();
      
    })
  }
  getUserDoc() {
    return this._backendService.getDoc("USERS", this.authState.uid).subscribe(
      (res) => {
        if (res) {
          this.data$ = this._backendService.getDoc("ROLES", res["role"]);
          this._backendService.setRole(this.data$);
        }
      },
      error => {},
      () => console.log("")
    );
  }

  logout() {
    this.afAuth.signOut().then(res => {
      this._router.navigate(['/landing']);
    }).catch(e => {
      console.log(e.message);
      this._router.navigate(['/landing']);
  });
  }
}
