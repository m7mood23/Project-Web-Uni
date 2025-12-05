// Load cart from browser storage when page starts
let cart = JSON.parse(localStorage.getItem("hypeaura-cart")) || [];

// Run these functions when page finishes loading
document.addEventListener("DOMContentLoaded", function() {
  setupFormValidation();
  updateCartCount();
  renderCartItems();
  setupAddToCartButtons();
  setupCheckoutButton();
  checkPageReload();
  displayWelcomeMsg();
});

// FORM VALIDATION
// Validates the registration form on home page
function setupFormValidation() {
  const form = document.querySelector(".needs-validation");
  
  // Stop if form doesnt exist on this page
  if (!form) return;
  
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Check if all fields are filled correctly
    if (form.checkValidity()) {
      // Get user data from form
      const userData = {
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        mobile: document.getElementById("mobile").value.trim(),
        email: document.getElementById("email").value.trim()
      };
      
      // Save to localStorage so it stays even after closing browser
      localStorage.setItem("hypeaura-user", JSON.stringify(userData));
      
      // Save to sessionStorage to show welcome message
      sessionStorage.setItem("hypeaura-show-welcome", "true");
      
      // Show success message
      alert("Registration successful! Welcome " + userData.firstName + " " + userData.lastName + "!");
      
      // Clear the form
      form.reset();
      form.classList.remove("was-validated");
      
      // Show welcome message in navbar
      displayWelcomeMsg();
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } else {
      // Show errors if form is invalid
      form.classList.add("was-validated");
    }
  }, false);
}

// Check if user reloaded the page
// This clears the welcome message on reload
function checkPageReload() {
  const navEntries = performance.getEntriesByType("navigation");
  
  if (navEntries.length > 0 && navEntries[0].type === "reload") {
    sessionStorage.removeItem("hypeaura-show-welcome");
  }
}

// WELCOME MESSAGE
// Show welcome message in navbar with users name
function displayWelcomeMsg() {
  const welcomeNav = document.getElementById("welcomeNav");
  const userNameNav = document.getElementById("userName");
  
  // Stop if elements dont exist
  if (!welcomeNav || !userNameNav) return;
  
  // Check both session and local storage
  const showWelcome = sessionStorage.getItem("hypeaura-show-welcome");
  const userData = JSON.parse(localStorage.getItem("hypeaura-user"));
  
  if (showWelcome === "true" && userData && userData.firstName) {
    // Show users full name
    userNameNav.textContent = userData.firstName + " " + userData.lastName;
    welcomeNav.style.display = "block";
  } else {
    // Hide welcome message
    welcomeNav.style.display = "none";
  }
}

// SHOPPING CART
// Setup all add to cart buttons
function setupAddToCartButtons() {
  const addButtons = document.querySelectorAll(".addToCartBtn");
  
  addButtons.forEach(function(button) {
    button.addEventListener("click", function() {
      // Get product info from button
      const name = this.getAttribute("data-name");
      const price = parseFloat(this.getAttribute("data-price"));
      const image = this.getAttribute("data-image");
      addToCart(name, price, image);
    });
  });
}

// Add product to cart or increase quantity
function addToCart(name, price, image) {
  const existingItem = cart.find(item => item.name === name);
  
  if (existingItem) {
    // Item already in cart so just increase quantity
    existingItem.quantity += 1;
  } else {
    // Add new item to cart
    cart.push({
      name: name,
      price: price,
      image: image,
      quantity: 1
    });
  }
  
  // Save cart to localStorage
  localStorage.setItem("hypeaura-cart", JSON.stringify(cart));
  
  // Update everything
  updateCartCount();
  renderCartItems();
  openCart();
}

// Remove item from cart
function removeFromCart(index) {
  cart.splice(index, 1);
  
  // Save updated cart
  localStorage.setItem("hypeaura-cart", JSON.stringify(cart));
  
  // Update display
  updateCartCount();
  renderCartItems();
}

// Update the cart count number in navbar
function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  
  if (!cartCount) return;
  
  // Count total items in cart
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  cartCount.textContent = totalItems;
  cartCount.style.display = totalItems > 0 ? "flex" : "none";
}

// Show all cart items in the sidebar
function renderCartItems() {
  const cartItemsContainer = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const cartEmpty = document.getElementById("cartEmpty");
  
  if (!cartItemsContainer) return;
  
  // Clear existing items
  cartItemsContainer.innerHTML = "";
  
  // Show empty message if no items
  if (cart.length === 0) {
    if (cartEmpty) cartEmpty.style.display = "block";
    if (cartTotal) cartTotal.textContent = "0.00";
    return;
  }
  
  if (cartEmpty) cartEmpty.style.display = "none";
  
  // Create HTML for each item
  cart.forEach(function(item, index) {
    const itemHTML = `
      <div class="cartItem">
        <img src="${item.image}" alt="${item.name}">
        <div class="cartItemInfo">
          <h6>${item.name}</h6>
          <p>BHD ${item.price.toFixed(2)} x ${item.quantity}</p>
        </div>
        <button class="cartItemRemove" onclick="removeFromCart(${index})">×</button>
      </div>
    `;
    cartItemsContainer.innerHTML += itemHTML;
  });
  
  // Calculate total price
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (cartTotal) cartTotal.textContent = total.toFixed(2);
}

// Open cart sidebar
function openCart() {
  const cartSidebar = document.getElementById("cartSidebar");
  const cartOverlay = document.getElementById("cartOverlay");
  
  if (cartSidebar) cartSidebar.classList.add("open");
  if (cartOverlay) cartOverlay.classList.add("open");
}

// Close cart sidebar
function closeCart() {
  const cartSidebar = document.getElementById("cartSidebar");
  const cartOverlay = document.getElementById("cartOverlay");
  
  if (cartSidebar) cartSidebar.classList.remove("open");
  if (cartOverlay) cartOverlay.classList.remove("open");
}

// CHECKOUT
// Setup checkout button click
function setupCheckoutButton() {
  const checkoutButtons = document.querySelectorAll(".redBtn");
  
  checkoutButtons.forEach(function(button) {
    // Only add to buttons that say Checkout
    if (button.textContent.trim() === "Checkout") {
      button.addEventListener("click", function() {
        handleCheckout();
      });
    }
  });
}

// Handle checkout process
function handleCheckout() {
  // Check if cart is empty
  if (cart.length === 0) {
    alert("Your cart is empty! Please add items before checkout.");
    return;
  }
  
  // Show success message
  alert("Thank you for your purchase!");
  
  // Empty the cart
  cart = [];
  localStorage.setItem("hypeaura-cart", JSON.stringify(cart));
  
  // Update everything
  updateCartCount();
  renderCartItems();
  
  // Close cart
  closeCart();
}

// PRODUCT SORTING
// Sort products by price on men women and new arrivals pages
function sortProducts(page) {
  const sortValue = document.getElementById("sortDropdown" + page).value;
  const container = document.getElementById("productContainer" + page);
  
  if (!container) return;
  
  // Get all products
  const products = Array.from(container.querySelectorAll(".productItem"));
  
  // Dont sort if featured is selected
  if (sortValue === "featured") {
    return;
  }
  
  // Sort low to high
  if (sortValue === "pricelow") {
    products.sort(function(a, b) {
      const priceA = parseFloat(a.getAttribute("data-price")) || 0;
      const priceB = parseFloat(b.getAttribute("data-price")) || 0;
      return priceA - priceB;
    });
  } 
  // Sort high to low
  else if (sortValue === "pricehigh") {
    products.sort(function(a, b) {
      const priceA = parseFloat(a.getAttribute("data-price")) || 0;
      const priceB = parseFloat(b.getAttribute("data-price")) || 0;
      return priceB - priceA;
    });
  }
  
  // Get all rows
  const rows = container.querySelectorAll(".row");
  
  // Remove products from current positions
  rows.forEach(function(row) {
    const rowProducts = row.querySelectorAll(".productItem");
    rowProducts.forEach(function(product) {
      product.remove();
    });
  });
  
  // Put sorted products back in first row
  const firstRow = rows[0];
  if (firstRow) {
    products.forEach(function(product) {
      firstRow.appendChild(product);
    });
  }
} 

// done nothing to write make sure you read again and again 