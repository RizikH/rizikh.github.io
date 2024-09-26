document.addEventListener("DOMContentLoaded", function () {
    introImgClickEvent();
    dishImgClickEvent();
    displayCartItems();
});

function introImgClickEvent() {
    const containers = document.querySelectorAll(".flexbox .img-container");

    containers.forEach(function (imgContainer) {
        const img = imgContainer.querySelector('img.intro-img');
        if (img) {
            img.addEventListener("click", function () {
                handleImageClick(imgContainer, containers);
            });
        }
    });
}

function dishImgClickEvent() {
    const dishContainers = document.querySelectorAll(".dish-info");

    dishContainers.forEach(function (dishContainer) {
        const dishImg = dishContainer.querySelector('img');
        if (dishImg) {
            dishImg.addEventListener("click", function () {

                document.querySelectorAll(".dish-info img").forEach(function (img) {
                    img.classList.remove("expand-img");
                });

                dishImg.classList.add("expand-img");

                toggleExpand(dishContainer, dishContainers);
            });
        }
    });
}



function handleImageClick(imgContainer, containers) {
    const info = imgContainer.querySelector('.info');
    if (imgContainer.classList.contains("active-img")) {
        imgContainer.classList.remove("active-img");
        hideInfo(imgContainer);
        containers.forEach(function (otherContainer) {
            otherContainer.style.display = "flex";
        });
    } else {
        containers.forEach(function (otherContainer) {
            if (otherContainer !== imgContainer) {
                otherContainer.style.display = "none";
            }
        });
        imgContainer.classList.add("active-img");
        showInfo(imgContainer);
    }
}

function showInfo(imgContainer) {
    const info = imgContainer.querySelector('.info');
    info.style.display = 'block';
}

function hideInfo(imgContainer) {
    const info = imgContainer.querySelector('.info');
    info.style.display = 'none';
}

function toggleExpand(currentDish, dishContainers) {
    dishContainers.forEach(function (dishContainer) {
        const expandSection = dishContainer.querySelector('.expand');
        if (dishContainer !== currentDish) {
            expandSection.style.display = 'none';
        }
    });

    const expandSection = currentDish.querySelector('.expand');
    const img = currentDish.querySelector('img');
    if (expandSection.style.display === "block") {
        expandSection.style.display = "none";
        img.classList.remove("expand-img");
    } else {
        expandSection.style.display = "block";
        img.classList.add("expand-img");
    }
}

function getCartItems() {
    const cartItems = localStorage.getItem('cart');
    if (cartItems) {
        return JSON.parse(cartItems);
    } else {
        return [];
    }
}

function displayCartItems() {
    const cartItems = getCartItems();
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    let total = 0;

    cartItemsContainer.innerHTML = '';

    cartItems.forEach(function (item, index) {
        const itemRow = document.createElement('div');
        itemRow.className = 'cart-item';
        itemRow.innerHTML = `
            <span>${item.name}</span>
            <span>$${item.price.toFixed(2)}</span>
        `;
        cartItemsContainer.appendChild(itemRow);

        total += item.price;

        itemRow.addEventListener('dblclick', function () {
            removeFromCart(index);
        });
    });

    totalPriceElement.textContent = total.toFixed(2);
}

function addToCart(itemName, itemPrice) {
    const cartItems = getCartItems();
    cartItems.push({ name: itemName, price: itemPrice });
    localStorage.setItem('cart', JSON.stringify(cartItems));
}

function removeFromCart(index) {
    const cartItems = getCartItems();
    cartItems.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    displayCartItems();
}

const addButtons = document.querySelectorAll('.add');
addButtons.forEach(function (button) {
    button.addEventListener('click', function () {
        const itemContainer = button.closest('.dish-info');
        const itemName = itemContainer.querySelector('h2').textContent;
        const itemPrice = parseFloat(itemContainer.querySelector('.price').textContent);
        addToCart(itemName, itemPrice);
        updateCartSummary();
    });
});

const salivatingBtn = document.querySelector(".salivating-btn");
salivatingBtn.addEventListener('click', function () {
    window.location.href = './blogs.html';
});

const spiceBtn = document.querySelector('.spice-btn');
spiceBtn.addEventListener('click', function () {
    window.location.href = '../../index.html';
});

function updateCartSummary() {
    const cartItems = getCartItems();
    let total = 0;
    cartItems.forEach(function (item) {
        total += item.price;
    });
    document.getElementById('total-price-box').textContent = total.toFixed(2);
}
