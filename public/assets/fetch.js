
function fetchProductNames() {
  var database = firebase.database();
  var productLabel = document.getElementById('productNm');
  productLabel.innerHTML = "";

  database.ref('Products').once('value', function (snapshot) {
    if (snapshot.exists()) {
      snapshot.forEach(function (data) {
        var val = data.val();
        // Create an option element for each product
        var option = document.createElement('option');
        option.value = val.productId; // Assuming productId is the property for product value
        option.text = val.productName; // Assuming productName is the property for product text
        productLabel.appendChild(option);
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  fetchCategoryNames();
  fetchProductNames();


});
function fetchCategoryNames() {
    var database = firebase.database();
    var categoryDropdown = document.getElementById('productCategory');
  
    database.ref('Categories').once('value', function (snapshot) {
      if (snapshot.exists()) {
        snapshot.forEach(function (data) {
          var val = data.val();
          // Create an option element for each category
          var option = document.createElement('option');
          option.value = val.categoryId;
          option.text = val.categoryName;
          categoryDropdown.appendChild(option);
          
        });
      }
    });
  }

  // function fetchProduct() {
  //   var database = firebase.database();
  //   var productDropdown = document.getElementById('product');
  
  //   database.ref('Products').once('value', function (snapshot) {
  //     if (snapshot.exists()) {
  //       snapshot.forEach(function (data) {
  //         var val = data.val();
  //         // Create an option element for each category
  //         var option = document.createElement('option');
  //         option.value = val.productId;
  //         option.text = val.productName;
  //         productDropdown.appendChild(option);
  //         fetchProductNames(val.productCategory) ;
  //       });
  //     }
  //   });
  // }


 
 