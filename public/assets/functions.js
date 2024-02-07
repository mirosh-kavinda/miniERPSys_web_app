async function sendMail(customerDetail) {
  var params = {
    customer: {
      name: customerDetail.customerName,
      address: customerDetail.customerAddress,
      city: "Cityville",
      state: "ST",
      zipCode: "12345",
      email: "mkavinda1900@gmail.com",
      phone: customerDetail.customerPhone
    },
    company: {
      name: "ABC Company",
      email: "info@abccompany.com",
      phone: "987-654-3210"
    },
    purchase: {
      date: "2024-01-28",
      invoiceNumber: "INV123456",
      subtotal: 300.00,
      tax: 15.00,
      total: 315.00
    },
    shipping: {
      name: "Jane Smith",
      address: "456 Shipping Ln",
      city: "Shipping City",
      state: "ST",
      zipCode: "54321"
    },
    products: [
      {
        name: "Product 1",
        description: "Description 1",
        quantity: 2,
        price: 50.00
      },
      {
        name: "Product 2",
        description: "Description 2",
        quantity: 1,
        price: 100.00
      },
      {
        name: "Product 3",
        description: "Description 3",
        quantity: 3,
        price: 50.00
      }
    ],
    payment: {
      method: "Credit Card",
      transactionID: "123456789",
      date: "2024-01-28",
      amountPaid: 315.00
    }
  };
  emailjs.init("nkNY1hE2EnJTUx7-X");
  console.log(params)
  emailjs.send('service_3me421f', 'template_f3ws2n2', params)
    .then(function (response) {
      console.log('SUCCESS!', response.status, response.text);
    }, function (error) {
      console.log('FAILED...', error);
    });

}


function addOrder() {

  try {
    var currentDate = new Date().toISOString();
    let OrderRef = firebase.database().ref('Orders').push();
    let CustomerRef = firebase.database().ref('Customers').push();

    
    let orderDetails = {
      "orderId": getRandomNumber(1, 500),
      "customerId": getRandomNumber(1, 100),
      "orderDate": currentDate,
      "orderStatus": 'pending',
      "totalAmount": 180000, // For the moment, keep it empty
      "Items": products
    }

    let customerDetail = {
      "customerId": orderDetails.customerId,
      "customerName": document.getElementById('customerName').value,
      "customerPhone": document.getElementById('phoneNumber').value,
      "customerEmail": document.getElementById('customerEmail').value,
      "customerAddress": document.getElementById('customerAddress').value
    }

    var isValid = validateForm();
    if (isValid) {
      OrderRef.set(orderDetails);
      CustomerRef.set(customerDetail);
      sendMail(customerDetail)
      alert("Order Added Successfully");
      window.location.reload();
    }

  }
  catch (e) {
    console.log(e);
  }

}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const products = [];

function productAdd() {
  const productName = document.getElementById('productNm').value.trim();
  const productCategory = document.getElementById('productCategory').value.trim();
  const quantity = document.getElementById('quantity').value.trim();
  const unitPrice = document.getElementById('unitPrice').value.trim();
  // Create a product object
  const product = {

    productName: productName,
    productCategory: productCategory,
    quantity,
    unitPrice,
    subTotal: unitPrice * quantity
  };

  // Add the product object to the array
  products.push(product);

  // Clear input fields
  document.getElementById('productNm').value = '';
  document.getElementById('productCategory').value = '';
  document.getElementById('quantity').value = '';
  document.getElementById('unitPrice').value = '';

  // Display a message or update UI as needed

  // Log the products array to console (for demonstration purposes)

  $("#productableContainer").show();
  populateTable('tableBody');
}



function populateTable(tablename) {
  var tableBody = document.getElementById(tablename);
  tableBody.innerHTML = "";

  // Loop through the array and create table rows
  products.forEach(function (item, index) {
    var row = document.createElement("tr");
    row.innerHTML = `
          <td>${item.productName}</td>
          <td>${item.productCategory}</td>
          <td>${item.quantity}</td>
          <td>${item.unitPrice}</td>
          <td>${item.subTotal}</td>
          <td><button class="btn btn-danger" onclick="removeRow(${index})">X</button></td>
        `;
    tableBody.appendChild(row);
  });
}

function removeAllRows() {
 
  products = [];
  while (tableBody.firstChild) {
    tableBody.removeChild(tableBody.firstChild);
  }
}



function removeRow(index) {
  products.splice(index, 1);
  tableBody.removeChild(tableBody.childNodes[index]);
  updateRowIndexes();
}

function updateRowIndexes() {
  var rows = tableBody.children;
  for (var i = 0; i < rows.length; i++) {
    rows[i].querySelector('button').setAttribute('onclick', `removeRow(${i})`);
  }
}


function validatePhoneNumber(input) {
  var phoneNumber = input.value;
  var phoneError = document.getElementById('phoneError');

  if (!/^\d{10}$/.test(phoneNumber)) {
    phoneError.textContent = "Phone number must be 10 digits";
  } else {
    phoneError.textContent = "";
  }
}

function validateEmail(input) {
  var email = input.value;
  var emailError = document.getElementById('emailError');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailError.textContent = "Invalid email format";
  } else {
    emailError.textContent = "";
  }
}

function validateForm() {
  var customerName = document.getElementById('customerName').value;
  var phoneNumber = document.getElementById('phoneNumber').value;
  var email = document.getElementById('customerEmail').value;
  var customerAddress = document.getElementById('customerAddress').value;

  if (customerName === "" || phoneNumber === "" || email === "" || customerAddress === "") {
    alert("All fields must be filled out");
    return false;
  }


  return true; // Allow form submission
}






function AddJob() {
  fetchJobViewData();
  $('#addedjob').show();

  
}


function ViewExistingOrderSummary() {


  var database = firebase.database();

    database.ref('Orders').once('value', function (snapshot) {
      if (snapshot.exists()) {
        var content = '';

        
        snapshot.forEach(function (data) {
          var val = data.val();

          var content = '<tr>';
          content += '<td>' + val.orderId + '</td>';
          content += '<td>' + val.customerId + '</td>';
          content += '<td>' + val.orderDate + '</td>';
          content += '<td>' + val.orderStatus + '</td>';
          content += '<td>' + val.totalAmount + '</td>';
          content += '<td>' + '<a href="#" data-target="#ViewProducts" onclick="viewItems(\'' + data.key + '\')" class="btn btn-secondary">View</a>' + '</td>';
          content += '<td>' + '<button onclick="cancelOrder(\'' + data.key + '\')" class="btn btn-danger">Cancel</button>' + '</td>';
          content += '</tr>';

          $('#table1').append(content);
        });
        $("#existing-orders").show();
      }
    });
  }
  function openModal() {
    var modal = document.getElementById('myModal');
    modal.style.display = 'block';
  }
  
  function closeModal() {
    var modal = document.getElementById('myModal');
    modal.style.display = 'none';
  }
function viewItems (key){

  var database = firebase.database();
  database.ref('Orders/'+key+'/Items/').once('value', function (snapshot) {
    var content = '';

    content += '  <thead> <tr>'
  
  
  
    
    content +=  ' <th>productName</th>'
    content +=  ' <th>productCategory</th>';
    content +=  '<th>quantity</th>';
    content +=   '<th>unitPrice</th>';
    content += '<th>subtotal</th>';
    content += '</thead></tr>';
    
    
    if (snapshot.exists()) {
      // Assuming the items are within an array and taking the 0th index
      var itemsArray = snapshot.val();
       itemsArray.forEach(function (data) {
        var val = data;
       
     
       
        content += '<tr>';
        content += '<td>' + val.productCategory + '</td>';
        content += '<td>' + val.productName + '</td>';
        content += '<td>' + val.quantity + '</td>';
        content += '<td>' + val.unitPrice + '</td>';
        content += '<td>' + val.subTotal + '</td>';
        content += '</tr>';
      
        $('#popupTable').html(content);
        }
        
      );
    
          // Display the modal
          openModal();
    }
  });
}
function cancelOrder(orderId) {
  var database = firebase.database();
  var ordersRef = database.ref('Orders');

  // Use remove() to delete the order with the specified orderId
  ordersRef.child(orderId).remove()
    .then(function () {
      alert('Order successfully deleted!');
      window.location.reload();
      // Optionally, you can refresh the order summary table or perform other actions
    })
    .catch(function (error) {
      console.error('Error deleting order: ', error);
    });
}



function calculateSteelQuantity() {
  var product = document.getElementById('jobproduct').value;
  var bundleWeight = parseFloat(document.getElementById('packageweight').value);

  // Assuming a simple calculation, you may need to adjust this based on your requirements
  var steelQuantity;
  //w
  switch (product) {
    case '8mm':
      steelQuantity = bundleWeight / 0.394; 
      break;
    case '10mm':
      steelQuantity = bundleWeight / 0.617; 
      break;
    case '12mm':
      steelQuantity = bundleWeight / 0.888; 
      break;
    case '16mm':
        steelQuantity = bundleWeight / 1.579; 
        break;
    case '20mm':
      steelQuantity = bundleWeight / 2.469; 
        break;
  
    default:
      steelQuantity = 0;
  }
  console.log(bundleWeight);
  console.log(steelQuantity);
  document.getElementById('stealquantity').value = Math.round(steelQuantity);
  document.getElementById('jobstealcount').value = Math.round(steelQuantity);
  // document.getElementById('calcBtn').checkVisibility.value = 'hidden';
}


function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fetchJobViewData() {

  var database = firebase.database();
  database.ref('Jobs').once('value', function (snapshot) {
    if (snapshot.exists()) {
      var content = '';
      snapshot.forEach(function (data, index) {
        var val = data.val();
        content += '<tr>';
        content += '<td>' + val.jobId + '</td>';
        content += '<td>' + val.Jobcomment + '</td>';
        content += '<td>' + val.stealcount + '</td>';
        content += '<td>' + val.jobCat + '</td>';
        content += '<td>' + val.orderId + '</td>';
        content += '<td>' + val.jobStatus + '</td>';
        content += '<td>' + val.jobDate + '</td>';
        content += '<td>' + '<button onclick="cancelJob(\'' + data.key + '\')" class="btn btn-danger">Cancel</button>' + '</td>';
        content += '</tr>';
      });
      $('#tableJob').append(content);
      $('#displayjob').show();
    }
  }); 
}

function fetchProductDetails() {
  var database = firebase.database();
  database.ref('Products').once('value', function (snapshot) {
    if (snapshot.exists()) {
      var content = '';
      snapshot.forEach(function (data) {
        var val = data.val();
        content += '<tr>';
        content += '<td>' + val.productId + '</td>';
        content += '<td>' + val.productName + '</td>';
        content += '<td>' + val.productCategory + '</td>';
        content += '<td>' + val.quantity + '</td>';
        content += '<td>' + val.unitPrice + '</td>';
        // Assuming you have a way to calculate subtotal based on quantity and unit price
     content += '</tr>';
      });
      $('#producttableBody').html(content);
      $('#productableContainer').show();
    }
  });
}


function addProduct(){
  try {
    var productName = document.getElementById('productName').value;
    var productCategory = document.getElementById('productCategory').value;
    var quantity = document.getElementById('quantity').value;
    var unitPrice = document.getElementById('unitPrice').value;
    var currentDate = new Date().toISOString();
    let ProductRef = firebase.database().ref('Products').push();
    let productDetails = {
      "productId": getRandomNumber(1, 500),
      "productName": productName,
      "productCategory": productCategory,
      "quantity": quantity,
      "unitPrice": unitPrice,
      "productDate": currentDate
    }
    ProductRef.set(productDetails);
    alert("Product Added Successfully");
    window.location.reload();
  }
  catch (e) {
    console.log(e);
  }
}

function addCategory() {
    try {
    var categoryId = document.getElementById('categoryId').value;
      var categoryName = document.getElementById('categoryName').value;
      var categoryArea = document.getElementById('categoryArea').value;

      let categoryRef = firebase.database().ref('Categories').push();
      let categoryDetails = {
          "categoryId": categoryId,
          "categoryName": categoryName,
          "categoryArea": categoryArea
          // You can add more fields as needed
      }
      categoryRef.set(categoryDetails);
      alert("Category Added Successfully");
      window.location.reload();

    document.getElementById('categoryId').value="";
    document.getElementById('categoryName').value="";
    document.getElementById('categoryArea').value="";
  } catch (e) {
      console.log(e);
  }
}
// C

const jobs = [];

function jobAdd() {
  try {
    var Jobcomment = document.getElementById('Jobcomment').value;
    var quantity = document.getElementById('jobstealcount').value;
    var jobCat = document.getElementById('jobCat').value;
    var orderId = document.getElementById('orderId').value;

    var currentDate = new Date().toISOString();
    let JobsRef = firebase.database().ref('Jobs').push();

    // Replace this with your logic to get the next order ID


    const job = {
      jobId: getRandomNumber(1, 100),
      Jobcomment: Jobcomment,
      stealcount: quantity,
      jobCat: jobCat,
      orderId: orderId,
      jobStatus: 'Pending',
      jobDate: currentDate
    };
    // Add your logic here to add the item to the order

    // Add the product object to the array
    jobs.push(job);
    JobsRef.set(job);
    document.getElementById('Jobcomment').value = '';
    document.getElementById('jobstealcount').value = '';
    document.getElementById('jobCat').value = '';
    document.getElementById('orderId').value = '';


    $("#addedjob").show();
    populateTable('tableBody');
    alert("Job Added Successfully");
    window.location.reload();
  }

  catch (e) {
    console.log(e);
  }

}

function cancelJob(JobId) {
  var database = firebase.database();
  var cancelJobRef = database.ref('Jobs');
  cancelJobRef.child(JobId).remove()
    .then(function () {
      alert('Order successfully deleted!');
      window.location.reload();
      window.location.reload();
      // Optionally, you can refresh the order summary table or perform other actions
    })
    .catch(function (error) {
      console.error('Error deleting order: ', error);
    });
  
}
  


function fetchCategoryDetails() {
  var database = firebase.database();
  database.ref('Categories').once('value', function (snapshot) {
      if (snapshot.exists()) {
          var content = '';
          snapshot.forEach(function (data) {
              var val = data.val();
              content += '<tr>';
              content += '<td>' + val.categoryId + '</td>';
              content += '<td>' + val.categoryName + '</td>';
              content += '<td>' + val.categoryArea + '</td>';
              content += '</tr>';
          });
          $('#CategorytableBody').html(content);
          $('#categoryTableContainer').show();
      }
  });
}