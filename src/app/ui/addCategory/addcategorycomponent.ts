import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { moveIn, fallIn } from '../../shared/router.animations';
import { Observable } from 'rxjs';
import { DataSource } from '@angular/cdk/collections';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AngularFireAuth } from '@angular/fire/auth';

import { BackendService } from '../../services/backend.service';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-addcategory',
  templateUrl: './addcategory.component.html',
  styleUrls: ['./addcategory.component.css'],
  animations: [moveIn(), fallIn()],
  host: { '[@moveIn]': '' }
})
export class AddCategoryComponent implements OnInit, OnDestroy {
  panelOpenState = false;
  products = ['Personal', 'Customer', 'Manufacturer', 'Vendor', 'Other', 'Campaign', 'Lead', 'Oppurtunity'];
  
  members: any[];
  dataSource: MatTableDataSource<any>;
  myDocData;
  data$;
  toggleField: string;
  state: string = '';
  savedChanges = false;
  error: boolean = false;
  errorMessage: String = "";
  dataLoading: boolean = false;
  private querySubscription;
  authState: any = null;

  total_amount = 0;
  addDataForm: FormGroup;
  editDataForm: FormGroup;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns = ['name', 'area', '_id'];
  // file upload
  docId: string;
  fileName: string;
  showFileUpload: boolean = false;
  showDocument: boolean = false;
  docUrl: Observable<string | null>;
  userRole$;

  constructor(public afAuth: AngularFireAuth, private _backendService: BackendService, private _fb: FormBuilder) {
    this._backendService.userRole$.subscribe(res => this.userRole$ = res);
  }

  ngOnInit() {
    this.toggleField = "searchMode";
    this.error = false;
    this.errorMessage = "";
    this.dataSource = new MatTableDataSource(this.members);
    this.addDataForm = this._fb.group({
      name: ['', [Validators.minLength(2), Validators.required]],
      area: ['', [Validators.required]],
    });
    this.editDataForm = this._fb.group({
      _id: ['', Validators.required],
      name: ['', [Validators.minLength(2), Validators.required]],
      area: ['', [Validators.required]],
    });
    this.afAuth.authState.subscribe(authState => {
      this.authState = authState;
    })
  }


  toggle(filter?) {
    if (!filter) { filter = "searchMode" }
    else { filter = filter; }
    this.toggleField = filter;
    this.dataLoading = false;
  }

  getData(formData?) {
    this.dataLoading = true;
    this.querySubscription = this._backendService.getDocs('PRODUCTCATEGOR', formData).subscribe((res) => {
      if (res.length > 0) {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    },
      (error) => {
        this.error = true;
        this.errorMessage = error.message;
        this.dataLoading = false;
      },
      () => {
        this.dataLoading = false;
      });
  }

  setData(formData) {
    this.dataLoading = true;
    console.log("hello")
    return this._backendService.setDoc('PRODUCTCATEGORY', formData, this.authState.uid).then(res => {
      if (res) {
        this.savedChanges = true;
        this.error = false;
        this.errorMessage = "";
        this.dataLoading = false;
      }
    }
    ).catch(err => {
      if (err) {
        console.log(err);
        this.error = true;
        this.errorMessage = err.message;
        this.dataLoading = false;
      }
    }
    );
  }

  updateData(formData) {
    this.dataLoading = true;
    this.querySubscription = this._backendService.updateDoc('PRODUCTCATEGORY', formData._id, formData).then(res => {
      if (res) {
        this.savedChanges = true;
        this.error = false;
        this.errorMessage = "";
        this.dataLoading = false;
      }
    }
    ).catch(err => {
      if (err) {
        this.error = true;
        this.errorMessage = err.message;
        this.dataLoading = false;
      }
    });
  }

  getDoc(docId) {
    this.docId = docId; // this is required to pass at file upload directive
    this.dataLoading = true;
    this.data$ = this._backendService.getDoc('PRODUCTCATEGORY', docId).subscribe(res => {
      if (res) {
        this.data$ = res;
        this.editDataForm = this._fb.group({
          _id: ['', Validators.required],
          name: ['', [Validators.minLength(2), Validators.required]],
          producttype: ['', [Validators.required]],
          quantity:  ['', [Validators.required]],
          unitprice:  ['', [Validators.required]],
        });
       
        this.toggle('editMode');
        this.dataLoading = false;
      }
    },
      (error) => {
        this.error = true;
        this.errorMessage = error.message;
        this.dataLoading = false;
      },
      () => {
        this.dataLoading = false;
      });
  }

  deleteDoc(docId) {
    if (confirm("Are you sure want to delete this record ?")) {
      this.dataLoading = true;
      this._backendService.deleteDoc('PRODUCTCATEGORY', docId).then(res => {
        if (res) {
          this.error = false;
          this.errorMessage = "";
          this.dataLoading = false;
        }
      }
      ).catch(err => {
        if (err) {
          this.error = true;
          this.errorMessage = err.message;
          this.dataLoading = false;
        }
      }
      );
    }
  }
  getDocUrl(docUrl) {
    this.fileName = docUrl;
    this.docUrl = this._backendService.getFileDownloadUrl(docUrl);
  }
  //mat table paginator and filter functions
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
  ngOnDestroy() {
    // this is not needed when observable is used, in this case, we are registering user on subscription
    if (this.querySubscription) {
      this.querySubscription.unsubscribe();
    }
  }
}