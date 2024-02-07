import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { moveIn, fallIn } from '../../shared/router.animations';
import { Observable } from 'rxjs';
// import { DatePipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AngularFireAuth } from '@angular/fire/auth';

import { BackendService } from '../../services/backend.service';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-workorders',
  templateUrl: './workorders.component.html',
  styleUrls: ['./workorders.component.css'],
  animations: [moveIn(), fallIn()],
  host: { '[@moveIn]': '' }
})
export class WorkordersComponent implements OnInit, OnDestroy {
  panelOpenState = false;
  stealbars: string[] = ['8mm', '10mm', '12mm', '16mm', '20mm'];
  contacts = ['Personal', 'Customer', 'Manufacturer', 'Vendor', 'Other', 'Campaign', 'Lead', 'Oppurtunity'];
  // addTypes = ['Home', 'Office', 'Primary', 'Mailing'];
  assignedTypes = ['Home', 'Office', 'Primary', 'Personal'];
  jobCat = ['SteelBarCounting', 'Transporting', 'Cleaning'];
  statuses = ['Open', 'In Progress', 'Hold', 'Closed'];
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
   timestamp ; // Example timestamp
    // Adjust the format as needed
  total_amount = 0;
  addDataForm: FormGroup;
  editDataForm: FormGroup;
  isStealBarSelect=false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns = ['jobCat', 'orderName', 'status','purpose','updatedAt', '_id'];
  // file upload
  docId: string;
  fileName: string;
  showFileUpload: boolean = false;
  showDocument: boolean = false;
  docUrl: Observable<string | null>;
  userRole$;
  orders;
  users;
  constructor(public afAuth: AngularFireAuth, private _backendService: BackendService, private _fb: FormBuilder) {
    this._backendService.userRole$.subscribe(res => this.userRole$ = res);
  }


  GetFormData(){
    this._backendService.getDocs("WORKORDERS").subscribe((res) => {
      if (res.length > 0) {
     this.orders=res;
      };
    });
    this._backendService.getDocs("USERS").subscribe((res) => {
      if (res.length > 0) {
     this.users=res;
      };
    });
  } 
  // formattedDate(row: any): string {
  //   return this.datePipe.transform(row.updatedAt, 'yyyy-MM-dd') || '-';
  // }



  selectJobCatRelatedData() {
    this.isStealBarSelect=true

 }
  calculateSteelQuantity() {
    // const product = '8mm';
    const bundleWeight = parseFloat(this.addDataForm.get('weight').value);
    let steelQuantity;

    // switch (product) {
    //   case '8mm':
    //     steelQuantity = bundleWeight / 0.394;
    //     break;
    //   case '10mm':
    //     steelQuantity = bundleWeight / 0.617;
    //     break;
    //   case '12mm':
    //     steelQuantity = bundleWeight / 0.888;
    //     break;
    //   case '16mm':
    //     steelQuantity = bundleWeight / 1.579;
    //     break;
    //   case '20mm':
    //     steelQuantity = bundleWeight / 2.469;
    //     break;
    //   default:
    //     steelQuantity = 0;
    // }
    steelQuantity = bundleWeight / 0.617;
    this.addDataForm.patchValue({
      quantity: Math.round(steelQuantity)
    });
    this.addDataForm.get('quantity').disable();
  }
  ngOnInit() {
    this.GetFormData();
    this.toggleField = "addMode";
    this.error = false;
    this.errorMessage = "";
    this.dataSource = new MatTableDataSource(this.members);
    this.addDataForm = this._fb.group({
      orderName: ['', [Validators.minLength(2), Validators.required]],
      jobCat: ['', [Validators.required]],
      weight: ['', [Validators.required]],
      quantity: ['', [Validators.required]],
      status: ['', [Validators.required]],
      purpose: ['',Validators.required],
      assigned: this._fb.array([])
      
    });
    this.editDataForm = this._fb.group({
      _id: ['', Validators.required],
      orderName: ['', [Validators.minLength(2), Validators.required]],
      jobCat: ['', [Validators.required]],
      weight: ['', [Validators.required]],
      quantity: ['', [Validators.required]],
      status: ['', [Validators.required]],
      purpose: ['',Validators.required],
      assigned: this._fb.array([])
    });
    this.afAuth.authState.subscribe(authState => {
      this.authState = authState;
    })
  }

  
  ASSIGNEDLINES(formName) {
    return this[formName].get('assigned') as FormArray;
  }

  addAssigned(formName) {
    this.ASSIGNEDLINES(formName).push(this._fb.group({
      assignedtype: [''],
      assigned: ['']
    }));
  }
  deleteAssigned(index, formName) {
    this.ASSIGNEDLINES(formName).removeAt(index);
  }


  toggle(filter?) {
    if (!filter) { filter = "searchMode" }
    else { filter = filter; }
    this.toggleField = filter;
    this.dataLoading = false;
  }

  getData(formData?) {
    this.dataLoading = true;
    this.querySubscription = this._backendService.getDocs('WORKORDERS', formData).subscribe((res) => {
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
    return this._backendService.setDoc('WORKORDERS', formData, this.authState.uid).then(res => {
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
    }
    );
  }

  updateData(formData) {
    this.dataLoading = true;
    this.querySubscription = this._backendService.updateDoc('WORKORDERS', formData._id, formData).then(res => {
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
    this.data$ = this._backendService.getDoc('WORKORDERS', docId).subscribe(res => {
      if (res) {
        this.data$ = res;
        this.editDataForm = this._fb.group({
          orderName: ['', [Validators.minLength(2), Validators.required]],
          jobCat: ['', [Validators.required]],
          weight: ['', [Validators.required]],
          quantity: ['', [Validators.required]],
          status: ['', [Validators.required]],
          purpose: ['',Validators.required],
          assigned: this._fb.array([])
          
        });
       
        for (let i = 0; i < this.data$["assigned"].length; i++) {
          this.ASSIGNEDLINES('editDataForm').push(this._fb.group(this.data$["assigned"][i]));
        }
        
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
      this._backendService.deleteDoc('WORKORDERS', docId).then(res => {
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