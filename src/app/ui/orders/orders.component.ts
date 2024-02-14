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
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
  animations: [moveIn(), fallIn()],
  host: { '[@moveIn]': '' }
})
export class OrdersComponent implements OnInit, OnDestroy {
  panelOpenState = false;
  contacts = ['Personal', 'Customer', 'Manufacturer', 'Vendor', 'Other', 'Order', 'Lead', 'Oppurtunity'];
  addTypes = ['Home', 'Office', 'Primary', 'Mailing'];
  assignedTypes = ['Home', 'Office', 'Primary', 'Personal'];
  expenseTypes = ['Home', 'Office', 'Primary', 'Personal'];
  statuses = ['Open', 'In Progress', 'Hold', 'Closed'];
  members: any[];
  users;
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
  products ;
  productCat ;


  total_amount = 0;
  addDataForm: FormGroup;
  editDataForm: FormGroup;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns = ['OrderType', 'name', 'purpose','updatedAt','status', '_id'];
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
    this.toggle('resMode')
    this.getData();
    this.error = false;
    this.errorMessage = "";
    this.dataSource = new MatTableDataSource(this.members);
    this.addDataForm = this._fb.group({
      name: ['', [Validators.minLength(2), Validators.required]],
      OrderType: ['', [Validators.required]],
      startDt: ['', [Validators.required]],
      endDt: ['', [Validators.required]],
      status: ['', [Validators.required]],
      purpose: ['',Validators.required],
      addresses: this._fb.array([]),
      assigned: this._fb.array([]),
      orderItems: this._fb.array([])
    });
    this.editDataForm = this._fb.group({
      _id: ['', Validators.required],
      name: ['', [Validators.minLength(2), Validators.required]],
      OrderType: ['', [Validators.required]],
      startDt: ['', [Validators.required]],
      endDt: ['', [Validators.required]],
      status: ['', [Validators.required]],
      purpose: ['',Validators.required],
      addresses: this._fb.array([]),
      assigned: this._fb.array([]),
      orderItems: this._fb.array([])
    });
    this.afAuth.authState.subscribe(authState => {
      this.authState = authState;
    })
    this.GetFormData();
  }
  
  
  GetFormData(){
    this._backendService.getDocs("PRODUCTCATEGORY").subscribe((res) => {
      if (res.length > 0) {
     this.productCat=res;
      };
    });
      this._backendService.getDocs("USERS").subscribe((res) => {
      if (res.length > 0) {
      this.users=res;
     this.users = this.users.filter(user => user.role !== 'admin');

      };
    });
  
  }

  ADDRESSLINES(formName) {
    return this[formName].get('addresses') as FormArray;
  }

  addAddress(formName) {
    this.ADDRESSLINES(formName).push(this._fb.group({
      addtype: [''],
      address: ['']
    }));
  }
  deleteAddress(index, formName) {
    this.ADDRESSLINES(formName).removeAt(index);
  }

  ASSIGNEDLINES(formName) {
    return this[formName].get('assigned') as FormArray;
  }

  addAssigned(formName) {
    this.ASSIGNEDLINES(formName).push(this._fb.group({
      assigned: ['']
    }));
  }
  deleteAssigned(index, formName) {
    this.ASSIGNEDLINES(formName).removeAt(index);
  }

  EXPENSESLINES(formName) {
    return this[formName].get('orderItems') as FormArray;
  }
  addExpenses(formName) {
    this.EXPENSESLINES(formName).push(this._fb.group({
      prodCat: [''],
      prodName: [''],
      quantity:[''],
      subtotal:0
    }));
  }
  deleteExpenses(index, formName) {
    this.EXPENSESLINES(formName).removeAt(index);
  }

  toggle(filter?) {
    if (!filter) { filter = "searchMode" }
    else { filter = filter; }
    this.toggleField = filter;
    this.dataLoading = false;
  }

  getData(formData?) {
    this.dataLoading = true;
    this.querySubscription = this._backendService.getDocs('ORDERS', formData).subscribe((res) => {
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
    return this._backendService.setDoc('ORDERS', formData, this.authState.uid).then(res => {
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
    this.querySubscription = this._backendService.updateDoc('ORDERS', formData._id, formData).then(res => {
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
    this.data$ = this._backendService.getDoc('ORDERS', docId).subscribe(res => {
      if (res) {
        this.data$ = res;
        this.editDataForm = this._fb.group({
          _id: ['', Validators.required],
          name: ['', [Validators.minLength(2), Validators.required]],
          OrderID: ['', [Validators.minLength(10), Validators.pattern("^[0-9]*$")]],
          OrderType: ['', [Validators.required]],
          startDt: ['', [Validators.required]],
          endDt: ['', [Validators.required]],
          status: ['', [Validators.required]],
          purpose: ['',Validators.required],
          addresses: this._fb.array([]),
          assigned: this._fb.array([]),
          orderItems: this._fb.array([])
        });
        this.editDataForm.patchValue(this.data$);
        for (let i = 0; i < this.data$["addresses"].length; i++) {
          this.ADDRESSLINES('editDataForm').push(this._fb.group(this.data$["addresses"][i]));
        }
        for (let i = 0; i < this.data$["assigned"].length; i++) {
          this.ASSIGNEDLINES('editDataForm').push(this._fb.group(this.data$["assigned"][i]));
        }
        for (let i = 0; i < this.data$["orderItems"].length; i++) {
          this.EXPENSESLINES('editDataForm').push(this._fb.group(this.data$["orderItems"][i]));
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
      this._backendService.deleteDoc('ORDERS', docId).then(res => {
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
  filterProducts(categoryId: any) {
    
    this._backendService.getDocs("PRODUCTS").subscribe((res) => {
      if (res.length > 0) {
     this.products=res;
     this.products = this.products.filter(prod => prod.producttype == categoryId.value);
      };
    });
    } 

    

    calculateSubtotal(index: number) {
      const orderItemsArray = this.addDataForm.get('orderItems') as FormArray; // Explicitly cast to FormArray
      const orderItem = orderItemsArray.at(index) as FormGroup; // Accessing form array controls by index
      const quantity = orderItem.get('quantity').value;
      const productName = orderItem.get('prodName').value;
    
      // Find the selected product based on the product name
      const selectedProduct = this.products.find(product => product.name === productName);
    
      const unitPrice = selectedProduct ? parseFloat(selectedProduct.unitprice) : 0;
    
      let subtotal = selectedProduct ? unitPrice * quantity : 0;
      subtotal = Math.round(subtotal * 100) / 100; // Round to two decimal places
    
      orderItem.get('subtotal').setValue(subtotal);
    }
    
    
}
