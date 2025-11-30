
// Initialize cart from localStorage when page loads
let cart = JSON.parse(localStorage.getItem("hypeaura-cart")) || [];

// Run all setup functions when the page finishes loading
document.addEventListener("DOMContentLoaded", function() {
  setupFormValidation();
  updateCartCount();
  renderCartItems();
  setupAddToCartButtons();
  setupCheckoutButton();
  checkPageReload();
  displayWelcomeMessageInNav();
});

// FORM VALIDATION SECTION
// This function validates the registration form on the home page
function setupFormValidation() {
  const form = document.querySelector(".needs-validation");
  
  // Exit if no form exists on current page
  if (!form) return;
  
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Check if all form fields are valid
    if (form.checkValidity()) {
      // Collect user data from form inputs
      const userData = {
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        mobile: document.getElementById("mobile").value.trim(),
        email: document.getElementById("email").value.trim()
      };
      
      // Save user data to localStorage for permanent storage
      localStorage.setItem("hypeaura-user", JSON.stringify(userData));
      
      // Set session flag to show welcome message
      sessionStorage.setItem("hypeaura-show-welcome", "true");
      
      // Display success message to user
      alert("Registration successful! Welcome " + userData.firstName + " " + userData.lastName + "!");
      
      // Reset form and remove validation styling
      form.reset();
      form.classList.remove("was-validated");
      
      // Update navbar with welcome message
      displayWelcomeMessageInNav();
      
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } else {
      // Show validation errors if form is invalid
      form.classList.add("was-validated");
    }
  }, false);
}

// Check if page was reloaded by user
// This clears the welcome message flag on page reload
function checkPageReload() {
  const navEntries = performance.getEntriesByType("navigation");
  
  if (navEntries.length > 0 && navEntries[0].type === "reload") {
    sessionStorage.removeItem("hypeaura-show-welcome");
  }
}

// WELCOME MESSAGE SECTION
// Display welcome message in navbar using stored user data
function displayWelcomeMessageInNav() {
  const welcomeNav = document.getElementById("welcome-nav");
  const userNameNav = document.getElementById("user-name-nav");
  
  // Exit if elements don't exist on current page
  if (!welcomeNav || !userNameNav) return;
  
  // Check both sessionStorage flag and localStorage user data
  const showWelcome = sessionStorage.getItem("hypeaura-show-welcome");
  const userData = JSON.parse(localStorage.getItem("hypeaura-user"));
  
  if (showWelcome === "true" && userData && userData.firstName) {
    // Display user's full name in navbar
    userNameNav.textContent = userData.firstName + " " + userData.lastName;
    welcomeNav.style.display = "block";
  } else {
    // Hide welcome message
    welcomeNav.style.display = "none";
  }
}

// SHOPPING CART SECTION
// Setup click listeners for all Add to Cart buttons
function setupAddToCartButtons() {
  const addButtons = document.querySelectorAll(".btn-add-cart");
  
  addButtons.forEach(function(button) {
    button.addEventListener("click", function() {
      // Get product details from button attributes
      const name = this.getAttribute("data-name");
      const price = parseFloat(this.getAttribute("data-price"));
      const image = this.getAttribute("data-image");
      addToCart(name, price, image);
    });
  });
}

// Add product to cart or increase quantity if already exists
function addToCart(name, price, image) {
  const existingItem = cart.find(item => item.name === name);
  
  if (existingItem) {
    // Increase quantity if item already in cart
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
  
  // Save updated cart to localStorage
  localStorage.setItem("hypeaura-cart", JSON.stringify(cart));
  
  // Update cart display
  updateCartCount();
  renderCartItems();
  openCart();
}

// Remove item from cart by index
function removeFromCart(index) {
  cart.splice(index, 1);
  
  // Update localStorage with new cart data
  localStorage.setItem("hypeaura-cart", JSON.stringify(cart));
  
  // Refresh cart display
  updateCartCount();
  renderCartItems();
}

// Update cart count badge in navbar
function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  
  if (!cartCount) return;
  
  // Calculate total number of items in cart
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  cartCount.textContent = totalItems;
  cartCount.style.display = totalItems > 0 ? "flex" : "none";
}

// Render all cart items in the cart sidebar
function renderCartItems() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const cartEmpty = document.getElementById("cart-empty");
  
  if (!cartItemsContainer) return;
  
  // Clear existing cart items
  cartItemsContainer.innerHTML = "";
  
  // Show empty cart message if no items
  if (cart.length === 0) {
    if (cartEmpty) cartEmpty.style.display = "block";
    if (cartTotal) cartTotal.textContent = "0.00";
    return;
  }
  
  if (cartEmpty) cartEmpty.style.display = "none";
  
  // Create HTML for each cart item
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
  
  // Calculate and display total price
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (cartTotal) cartTotal.textContent = total.toFixed(2);
}

// Open cart sidebar and overlay
function openCart() {
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartOverlay = document.getElementById("cart-overlay");
  
  if (cartSidebar) cartSidebar.classList.add("open");
  if (cartOverlay) cartOverlay.classList.add("open");
}

// Close cart sidebar and overlay
function closeCart() {
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartOverlay = document.getElementById("cart-overlay");
  
  if (cartSidebar) cartSidebar.classList.remove("open");
  if (cartOverlay) cartOverlay.classList.remove("open");
}

// CHECKOUT SECTION
// Setup click listener for checkout button
function setupCheckoutButton() {
  const checkoutButtons = document.querySelectorAll(".btn-accent");
  
  checkoutButtons.forEach(function(button) {
    // Only add listener to buttons with Checkout text
    if (button.textContent.trim() === "Checkout") {
      button.addEventListener("click", function() {
        handleCheckout();
      });
    }
  });
}

// Handle checkout process
function handleCheckout() {
  // Check if cart has items before checkout
  if (cart.length === 0) {
    alert("Your cart is empty! Please add items before checkout.");
    return;
  }
  
  // Show purchase confirmation message
  alert("Thank you for your purchase!");
  
  // Clear cart after successful purchase
  cart = [];
  localStorage.setItem("hypeaura-cart", JSON.stringify(cart));
  
  // Update cart display to reflect empty cart
  updateCartCount();
  renderCartItems();
  
  // Close cart sidebar
  closeCart();
}

// PRODUCT SORTING SECTION
// Sort products by price on Men, Women, and New Arrivals pages
function sortProducts(page) {
  const sortValue = document.getElementById("sort-dropdown-" + page).value;
  const container = document.getElementById("product-container-" + page);
  
  if (!container) return;
  
  // Get all product items from container
  const products = Array.from(container.querySelectorAll(".product-item"));
  
  // Don't sort if Featured is selected
  if (sortValue === "featured") {
    return;
  }
  
  // Sort products by price low to high
  if (sortValue === "price-low") {
    products.sort(function(a, b) {
      const priceA = parseFloat(a.getAttribute("data-price")) || 0;
      const priceB = parseFloat(b.getAttribute("data-price")) || 0;
      return priceA - priceB;
    });
  } 
  // Sort products by price high to low
  else if (sortValue === "price-high") {
    products.sort(function(a, b) {
      const priceA = parseFloat(a.getAttribute("data-price")) || 0;
      const priceB = parseFloat(b.getAttribute("data-price")) || 0;
      return priceB - priceA;
    });
  }
  
  // Get all row containers
  const rows = container.querySelectorAll(".row");
  
  // Remove products from their current positions
  rows.forEach(function(row) {
    const rowProducts = row.querySelectorAll(".product-item");
    rowProducts.forEach(function(product) {
      product.remove();
    });
  });
  
  // Add sorted products back to first row
  const firstRow = rows[0];
  if (firstRow) {
    products.forEach(function(product) {
      firstRow.appendChild(product);
    });
  }
}