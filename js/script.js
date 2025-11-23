/* ==============================
   HYPEAURA SHOPPING CART + FORM VALIDATION
   Using localStorage AND sessionStorage
   ============================== */

// ========== LOCALSTORAGE - Get cart data when page loads ==========
let cart = JSON.parse(localStorage.getItem("hypeaura-cart")) || [];

// Run when page loads
document.addEventListener("DOMContentLoaded", function() {
  updateCartCount();
  renderCartItems();
  setupAddToCartButtons();
  setupFormValidation();
  checkPageReload();
  displayWelcomeMessage();
});

// ========== CHECK IF PAGE WAS RELOADED ==========
function checkPageReload() {
  const navEntries = performance.getEntriesByType("navigation");
  
  if (navEntries.length > 0 && navEntries[0].type === "reload") {
    sessionStorage.removeItem("hypeaura-show-welcome");
  }
}

// ========== ADD TO CART FUNCTIONALITY ==========
function setupAddToCartButtons() {
  const addButtons = document.querySelectorAll(".btn-add-cart");
  
  addButtons.forEach(function(button) {
    button.addEventListener("click", function() {
      const name = this.getAttribute("data-name");
      const price = parseFloat(this.getAttribute("data-price"));
      const image = this.getAttribute("data-image");
      addToCart(name, price, image);
    });
  });
}

function addToCart(name, price, image) {
  const existingItem = cart.find(item => item.name === name);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name: name,
      price: price,
      image: image,
      quantity: 1
    });
  }
  
  localStorage.setItem("hypeaura-cart", JSON.stringify(cart));
  
  updateCartCount();
  renderCartItems();
  openCart();
}

// ========== REMOVE FROM CART ==========
function removeFromCart(index) {
  cart.splice(index, 1);
  
  localStorage.setItem("hypeaura-cart", JSON.stringify(cart));
  
  updateCartCount();
  renderCartItems();
}

// ========== UPDATE CART COUNT BADGE ==========
function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  if (cartCount) {
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? "flex" : "none";
  }
}

// ========== RENDER CART ITEMS IN SIDEBAR ==========
function renderCartItems() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const cartEmpty = document.getElementById("cart-empty");
  
  if (!cartItemsContainer) return;
  
  cartItemsContainer.innerHTML = "";
  
  if (cart.length === 0) {
    if (cartEmpty) cartEmpty.style.display = "block";
    if (cartTotal) cartTotal.textContent = "0.00";
    return;
  }
  
  if (cartEmpty) cartEmpty.style.display = "none";
  
  cart.forEach(function(item, index) {
    const itemHTML = `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <h6>${item.name}</h6>
          <p>BHD ${item.price.toFixed(2)} x ${item.quantity}</p>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${index})">×</button>
      </div>
    `;
    cartItemsContainer.innerHTML += itemHTML;
  });
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (cartTotal) cartTotal.textContent = total.toFixed(2);
}

// ========== OPEN/CLOSE CART SIDEBAR ==========
function openCart() {
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartOverlay = document.getElementById("cart-overlay");
  if (cartSidebar) cartSidebar.classList.add("open");
  if (cartOverlay) cartOverlay.classList.add("open");
}

function closeCart() {
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartOverlay = document.getElementById("cart-overlay");
  if (cartSidebar) cartSidebar.classList.remove("open");
  if (cartOverlay) cartOverlay.classList.remove("open");
}

// ==============================
// FORM VALIDATION
// ==============================

function setupFormValidation() {
  const form = document.querySelector(".form-panel");
  if (!form) return;
  
  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const mobile = document.getElementById("mobile");
  const email = document.getElementById("email");
  
  if (firstName) firstName.addEventListener("input", function() { validateName(this, "First name"); });
  if (lastName) lastName.addEventListener("input", function() { validateName(this, "Last name"); });
  if (mobile) mobile.addEventListener("input", function() { validateMobile(this); });
  if (email) email.addEventListener("input", function() { validateEmail(this); });
  
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    
    let isValid = true;
    
    if (!validateName(firstName, "First name")) isValid = false;
    if (!validateName(lastName, "Last name")) isValid = false;
    if (!validateMobile(mobile)) isValid = false;
    if (!validateEmail(email)) isValid = false;
    
    if (isValid) {
      const userData = {
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        mobile: mobile.value.trim(),
        email: email.value.trim()
      };
      localStorage.setItem("hypeaura-user", JSON.stringify(userData));
      
      sessionStorage.setItem("hypeaura-show-welcome", "true");
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      form.reset();
      clearAllErrors();
      
      displayWelcomeMessage();
    }
  });
}

// ========== VALIDATE NAME (First & Last) ==========
function validateName(input, fieldName) {
  const value = input.value.trim();
  let errorMsg = "";
  
  if (value === "") {
    errorMsg = fieldName + " is required.";
  }
  else if (value.length < 3) {
    errorMsg = fieldName + " must be at least 3 characters.";
  }
  else if (value.length > 20) {
    errorMsg = fieldName + " must be less than 20 characters.";
  }
  else if (!/^[a-zA-Z]/.test(value)) {
    errorMsg = fieldName + " must start with a letter.";
  }
  else if (!/^[a-zA-Z]+$/.test(value)) {
    errorMsg = fieldName + " can only contain letters (no numbers or symbols).";
  }
  
  showError(input, errorMsg);
  return errorMsg === "";
}

// ========== VALIDATE MOBILE (Exactly 8 digits) ==========
function validateMobile(input) {
  const value = input.value.trim();
  let errorMsg = "";
  
  if (value === "") {
    errorMsg = "Mobile number is required.";
  }
  else if (!/^\d+$/.test(value)) {
    errorMsg = "Mobile number can only contain digits.";
  }
  else if (value.length !== 8) {
    errorMsg = "Mobile number must be exactly 8 digits.";
  }
  
  showError(input, errorMsg);
  return errorMsg === "";
}

// ========== VALIDATE EMAIL ==========
function validateEmail(input) {
  const value = input.value.trim();
  let errorMsg = "";
  
  if (value === "") {
    errorMsg = "Email is required.";
  }
  else if (/\s/.test(value)) {
    errorMsg = "Email cannot contain spaces.";
  }
  else if (!value.includes("@")) {
    errorMsg = "Email must contain @ symbol.";
  }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    errorMsg = "Please enter a valid email address.";
  }
  
  showError(input, errorMsg);
  return errorMsg === "";
}

// ========== SHOW/HIDE ERROR MESSAGES ==========
function showError(input, message) {
  const existingError = input.parentElement.querySelector(".error-message");
  if (existingError) existingError.remove();
  
  if (message) {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message text-danger small mt-1";
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);
  } else {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
  }
}

function clearAllErrors() {
  const errors = document.querySelectorAll(".error-message");
  errors.forEach(error => error.remove());
  
  const inputs = document.querySelectorAll(".form-control");
  inputs.forEach(input => {
    input.classList.remove("is-invalid");
    input.classList.remove("is-valid");
  });
}

// ==============================
// WELCOME MESSAGE DISPLAY
// ==============================

function displayWelcomeMessage() {
  const showWelcome = sessionStorage.getItem("hypeaura-show-welcome");
  
  const userData = JSON.parse(localStorage.getItem("hypeaura-user"));
  
  const welcomeElement = document.getElementById("welcome-message");
  
  if (welcomeElement && showWelcome === "true" && userData && userData.firstName) {
    welcomeElement.textContent = "Hello, " + userData.firstName + " " + userData.lastName + "!";
    welcomeElement.style.display = "block";
  } else if (welcomeElement) {
    welcomeElement.style.display = "none";
  }
}

// ==============================
// PRODUCT SORTING FUNCTION
// ==============================

function sortProducts(page) {
  // Get the dropdown value
  var sortValue = document.getElementById("sort-dropdown-" + page).value;
  
  // Get the product container
  var container = document.getElementById("product-container-" + page);
  
  // Get all product items
  var products = Array.from(container.getElementsByClassName("product-item"));
  
  // Sort based on selected option
  if (sortValue === "price-low") {
    // Sort: Price Low to High
    products.sort(function(a, b) {
      var priceA = parseFloat(a.getAttribute("data-price"));
      var priceB = parseFloat(b.getAttribute("data-price"));
      return priceA - priceB;
    });
  } else if (sortValue === "price-high") {
    // Sort: Price High to Low
    products.sort(function(a, b) {
      var priceA = parseFloat(a.getAttribute("data-price"));
      var priceB = parseFloat(b.getAttribute("data-price"));
      return priceB - priceA;
    });
  }
  // If "featured", do nothing (keep original order)
  
  // Clear container
  container.innerHTML = "";
  
  // Re-append sorted products
  products.forEach(function(product) {
    container.appendChild(product);
  });
}