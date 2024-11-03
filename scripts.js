// Cache DOM elements at the top of your script
const loginContainer = document.getElementById('login-container');
const formContainer = document.getElementById('form-container');
const menuContainer = document.getElementById('menu-container');
const userInfoBtn = document.getElementById('user-info-btn');
const userDropdown = document.getElementById('user-dropdown'); 
const logoutBtn = document.getElementById('logout-btn');
const tableContainer = document.querySelector('.table-container');

function toggleVisibility(showElement, hideElement) {
    showElement.style.display = 'block';
    hideElement.style.display = 'none';
}

// Function to run when the window loads
window.onload = function () {
    if (localStorage.getItem('loggedIn') === 'true') {
        const username = localStorage.getItem('username');
        if (username) {
            const menuHeader = document.querySelector('#menu-container h2');
            menuHeader.textContent = 'Hai, ' + username + '!';
            userInfoBtn.textContent = username;  // Update button text
            toggleVisibility(menuContainer, loginContainer); // Show menu container
            formContainer.style.display = 'none'; // Ensure the form is hidden initially
        }
    } else {
        toggleVisibility(loginContainer, menuContainer); // Show login form if not logged in
        formContainer.style.display = 'none'; // Ensure the form is hidden initially
    }
    resetTimer();  // Reset inactivity timer
};


 // Toggle dropdown visibility when the user info button is clicked
userInfoBtn.addEventListener('click', () => {
    const userDropdown = document.getElementById('user-dropdown');
    userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block'; // Toggle visibility
});

// Logout function
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    toggleVisibility(loginContainer, formContainer); // Show login form
    alert('Kamu telah keluar.');
    location.reload(); // Optional: Reload the page
});

// Function to handle login
function login(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('https://script.google.com/macros/s/AKfycbyd-FvnNJMC7pTNOOEeWgHBJmP4MRMNLOwi_fOwwcg9877m7pSGxgkv_qTgYaMu8FsT/exec')
        .then(response => response.json())
        .then(credentials => {
            const user = credentials.find(user => user.username === username && user.password === password);
            if (user) {
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('username', user.username);
                toggleVisibility(menuContainer, loginContainer); // Show the main form
                userInfoBtn.textContent = user.username; // Update button text
            } else {
                alert('Akun salah, coba lagi.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Gagal masuk, coba lagi nanti.');
        });
}

// Attach login event to the form
document.getElementById('login-form').addEventListener('submit', login);

 // Handle the menu buttons for navigating
 document.getElementById('fill-form-btn').addEventListener('click', function() {
     document.getElementById('menu-container').style.display = 'none';
     document.getElementById('form-container').style.display = 'block';
 });

 // Event listener for the show data button
 document.getElementById('show-data-btn').addEventListener('click', function() {
     document.getElementById('menu-container').style.display = 'none'; // Hide the menu
     fetchSheetData(); // Call the function to fetch data and display it
 });

 

 // Fetch user-specific data from Google Sheets
 function fetchSheetData() {
     const sheetId = '1-Appfrc9S7RzJZO5aq4oxn73FtaOregvL3vOzpGJf6M'; // Your Google Sheet ID
     const apiKey = 'AIzaSyCMf51O_3RxFirEV1lzzwzGZtISqnrAfB0'; // Your API key
     const loggedInUser = localStorage.getItem('username'); // Get the logged-in user's username

     const sheetRanges = [`${loggedInUser}!A1:AL`]; // Ensure the username is the correct sheet name
     const rangesQuery = sheetRanges.map(range => `ranges=${encodeURIComponent(range)}`).join('&');

     const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchGet?${rangesQuery}&key=${apiKey}`;

     fetch(url)
         .then(response => {
             if (!response.ok) {
                 throw new Error(`Network response was not ok: ${response.statusText}`);
             }
             return response.json();
         })
         .then(data => {
             if (data.valueRanges && data.valueRanges[0].values && data.valueRanges[0].values.length > 0) {
                 displayUserData(data.valueRanges[0].values); // Call the function to display data
                 document.getElementById('data-view-container').style.display = 'block'; // Show the data view container
             } else {
                 alert('No data found for this user.');
             }
         })
         .catch(error => {
             console.error('Error fetching sheet data:', error);
             alert('Error fetching your data. Check the console for more details.');
         });
 }

// Fungsi untuk menampilkan data pengguna dengan Row ID tersembunyi
function displayUserData(data) {
    const tableContainer = document.getElementById('table-container');
    tableContainer.innerHTML = ''; // Clear previous content

    // Add table headers
    const headers = data[0];
    let tableHtml = `<table border="1"><thead><tr>${headers.map(header => `<th>${header}</th>`).join('')}<th>Actions</th></tr></thead><tbody>`;

    // Add data rows with "Edit" and "See Details" buttons
    data.slice(1).forEach((row, index) => {
        const rowId = index + 2; // Row ID for reference
        tableHtml += `<tr data-row-id="${rowId}">${row.map(cell => `<td>${cell || ''}</td>`).join('')}
            <td>
                <button onclick="editRow(this)">Edit</button>
                <button onclick="viewDetails(${rowId})">Detail</button>
            </td>
        </tr>`;
    });

    tableHtml += '</tbody></table>';
    tableContainer.innerHTML = tableHtml;
}

function editRow(button) {
    const row = button.closest('tr');
    const cells = row.querySelectorAll('td');

    // Ambil Row ID dari atribut data-row-id
    const rowId = row.getAttribute('data-row-id');
    document.getElementById('row-id').value = rowId; // Set Row ID di input hidden

    const formElements = [
        { id: 'name', cellIndex: 0 },
        { id: 'address', cellIndex: 1 },
        { id: 'age', cellIndex: 2 },
        { id: 'phone', cellIndex: 3 },
        { id: 'Status Pelanggan', cellIndex: 4, type: 'radio' },
        { id: 'coordinates', cellIndex: 5 },
        { id: 'lensa', cellIndex: 6, type: 'radio' },
        { id: 'frame', cellIndex: 7 },
        { id: 'harga-awal', cellIndex: 8 },
        { id: 'harga-tt', cellIndex: 9 },
        { id: 'harga-akhir', cellIndex: 10 },
        { id: 'sph-kanan', cellIndex: 11 },
        { id: 'cyl-kanan', cellIndex: 12 },
        { id: 'axis-kanan', cellIndex: 13 },
        { id: 'sph-kiri', cellIndex: 14 },
        { id: 'cyl-kiri', cellIndex: 15 },
        { id: 'axis-kiri', cellIndex: 16 },
        { id: 'sph-add', cellIndex: 17 },
        { id: 'cyl-add', cellIndex: 18 },
        { id: 'axis-add', cellIndex: 19 },
        { id: 'dp', cellIndex: 20 },
        { id: 'pengiriman', cellIndex: 21 },
        { id: 'tanggal-1', cellIndex: 22 },
        { id: 'bayar-1', cellIndex: 23 },
        { id: 'tanggal-2', cellIndex: 24 },
        { id: 'bayar-2', cellIndex: 25 },
        { id: 'tanggal-3', cellIndex: 26 },
        { id: 'bayar-3', cellIndex: 27 },
        { id: 'tanggal-4', cellIndex: 28 },
        { id: 'bayar-4', cellIndex: 29 },
        { id: 'tanggal-5', cellIndex: 30 },
        { id: 'bayar-5', cellIndex: 31 },
        { id: 'tanggal-6', cellIndex: 32 },
        { id: 'bayar-6', cellIndex: 33 },
        { id: 'tanggal-7', cellIndex: 34 },
        { id: 'bayar-7', cellIndex: 35 },
        { id: 'stok lensa', cellIndex: 36, type: 'radio' }
    ];

    // Loop untuk mengisi form dan menambahkan atribut readOnly
    formElements.forEach(({ id, cellIndex, type }) => {
        const cellValue = cells[cellIndex]?.textContent || '';
        
        if (type === 'radio') {
            const radioElement = document.querySelector(`input[name="${id}"][value="${cellValue}"]`);
            if (radioElement) {
                radioElement.checked = true;
                // Set radio buttons jadi read-only
                document.querySelectorAll(`input[name="${id}"]`).forEach(radio => radio.disabled = true);
            }
        } else {
            const formElement = document.getElementById(id);
            if (formElement) {
                formElement.value = cellValue;
                formElement.readOnly = !!cellValue; // Set readOnly jika ada nilai
            }
        }
    });

    // Tampilkan form dan sembunyikan tampilan data
    document.getElementById('data-view-container').style.display = 'none';
    document.getElementById('form-container').style.display = 'block';

    // Ubah teks tombol submit menjadi "Update"
    const submitButton = document.getElementById('submit-button');
    submitButton.value = "Update";
    submitButton.setAttribute("data-mode", "edit"); // Tandai mode edit
}

 // Search function
 function searchDataInView() {
    const input = document.getElementById('search-view-input').value.toLowerCase();
    const table = document.querySelector('#table-container table');
    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const rowText = Array.from(cells).map(cell => cell.textContent.toLowerCase()).join(' '); // Use only once
        row.style.display = rowText.includes(input) ? '' : 'none'; // Show or hide based on the search input
    });
}

 // Back button for data view
 document.getElementById('back-to-data-btn').addEventListener('click', function() {
     document.getElementById('data-view-container').style.display = 'none'; 
     document.getElementById('menu-container').style.display = 'block'; 
 });

function viewDetails(rowId) {
    const row = document.querySelector(`tr[data-row-id="${rowId}"]`);
    const cells = row.querySelectorAll('td');

    // Populate the summary fields in the "Rincian Pembayaran Pelanggan" section
    document.getElementById('summary-nama').textContent = cells[0].textContent; // Nama
    document.getElementById('summary-alamat').textContent = cells[1].textContent; // Alamat
    document.getElementById('summary-hp').textContent = cells[3].textContent; // HP

    document.getElementById('summary-tanggal-dp').textContent = cells[21]?.textContent || '-';
    document.getElementById('summary-bayar-dp').textContent = cells[20]?.textContent || '-';

    // Assuming the payment fields start from a specific column
    for (let i = 1; i <= 7; i++) {
        document.getElementById(`summary-tanggal-${i}`).textContent = cells[22 + (i - 1) * 2]?.textContent || '-';
        document.getElementById(`summary-bayar-${i}`).textContent = cells[23 + (i - 1) * 2]?.textContent || '-';
    }

    // Set the remaining balance
    document.getElementById('summary-sisa-cicilan').textContent = cells[37]?.textContent || '-';

    // Show the payment summary section and hide other sections
    document.getElementById('data-view-container').style.display = 'none';
    document.getElementById('payment-summary-container').style.display = 'block';
}

document.getElementById('back-to-data-btn').addEventListener('click', function() {
    document.getElementById('data-view-container').style.display = 'none';
    document.getElementById('menu-container').style.display = 'block';
});

document.getElementById('back-to-menu-from-summary-btn').addEventListener('click', function() {
    document.getElementById('payment-summary-container').style.display = 'none';
    document.getElementById('menu-container').style.display = 'block';
});


 // Toggle Password Visibility
 document.getElementById('togglePassword').addEventListener('change', function() {
     const passwordInput = document.getElementById('password');
     passwordInput.type = this.checked ? 'text' : 'password';
 });

 let logoutTimer;
 const inactivityLimit = 10 * 60 * 1000; // Set inactivity limit to 10 minutes

 // Reset the inactivity timer
 function resetTimer() {
     clearTimeout(logoutTimer);  // Clear the previous timer
     logoutTimer = setTimeout(logout, inactivityLimit);  // Reset the timer
 }

 // Logout due to inactivity
 function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    toggleVisibility(loginContainer, formContainer); // Use toggleVisibility
    toggleVisibility(loginContainer, menuContainer);
    alert('You have been logged out due to inactivity.');
}


 // Start inactivity timer if logged in
 if (localStorage.getItem('loggedIn') === 'true') {
     resetTimer();  // Start the inactivity timer
 }

 // Listen for user activity
 window.addEventListener('mousemove', resetTimer);
 window.addEventListener('keypress', resetTimer);
 window.addEventListener('click', resetTimer);
 window.addEventListener('touchstart', resetTimer);  // For mobile users
 // Automatically log out if the user is already logged in but inactive
 if (localStorage.getItem('loggedIn') === 'true') {
     resetTimer();  // Start the inactivity timer
 }

 // Automatically show the form if the user is already logged in
 if (localStorage.getItem('loggedIn') === 'true') {
     document.getElementById('login-container').style.display = 'none';
     document.getElementById('form-container').style.display = 'block';
  }
 //biar balik nggulung
 document.addEventListener('DOMContentLoaded', function () {
     const collapsibles = document.getElementsByClassName("collapsible");
     for (let i = 0; i < collapsibles.length; i++) {
         collapsibles[i].addEventListener("click", function () {
             this.classList.toggle("active");
             const content = this.nextElementSibling;
             if (content.style.maxHeight) {
                 content.style.maxHeight = null;
             } else {
                 content.style.maxHeight = content.scrollHeight + "px";
             }
         });
     }
 });
 
function submitForm(event) {
    event.preventDefault(); // Prevent default form submission

    // Set the logged-in user's username in the hidden field
    document.getElementById('username-field').value = localStorage.getItem('username');

    const form = document.getElementById('form');
    const formData = new FormData(form);

    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.style.display = 'block';

    // Disable the submit button
    const submitButton = document.getElementById('submit-button'); // Ensure you have an ID for the submit button
    submitButton.disabled = true;

    // Send the form data to the Google Apps Script URL
    fetch(form.action, {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (response.ok) {
            alert('Data berhasil terinput');
            form.reset(); // Reset the form after successful submission

            // Reset collapsible sections to their original state
            const collapsibles = document.getElementsByClassName("collapsible");
            for (let i = 0; i < collapsibles.length; i++) {
                collapsibles[i].classList.remove("active");
                const content = collapsibles[i].nextElementSibling;
                content.style.maxHeight = null;
            }
        } else {
            alert('Ada kesalahan dalam datamu. Tolong ulang lagi.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ada yang eror saat kamu masukkan data. Tolong ulang lagi.');
    })
    .finally(() => {
        // Hide loading indicator
        loadingIndicator.style.display = 'none';
        // Re-enable the submit button
        submitButton.disabled = false;
    });
}

function toggleOtherInput() {
    const otherInput = document.getElementById('lensa-other-text');
    otherInput.style.display = 'block';
}

// Optional: Add a function to hide the other input if another radio is selected
const radioButtons = document.querySelectorAll('input[name="lensa"]');
radioButtons.forEach(button => {
    button.addEventListener('change', function() {
        if (this.value !== 'Other') {
            document.getElementById('lensa-other-text').style.display = 'none';
        }
    });
});


 document.getElementById('back-to-menu-btn').addEventListener('click', function() {
     document.getElementById('menu-container').style.display = 'block'; 
     document.getElementById('form-container').style.display = 'none'; 
 });

     document.addEventListener('DOMContentLoaded', function() {
     const tableContainer = document.querySelector('.table-container');
     const table = tableContainer.querySelector('table');

     // Check if table exists before trying to access its properties
     if (table) {
         // Adjust table width based on container width
         if (table.offsetWidth > window.innerWidth) {
             tableContainer.style.overflowX = 'auto'; // Enable horizontal scroll if overflow
         } else {
             tableContainer.style.overflowX = 'hidden'; // Hide scroll if no overflow
         }
     } else {
         console.error('Table not found in the container.'); // Log error if table is null
     }
 });

 // Also, make sure to attach the resize event to adjust on window size change
 window.addEventListener('resize', function() {
     const tableContainer = document.querySelector('.table-container');
     const table = tableContainer.querySelector('table');

     if (table) {
         // Adjust table width based on container width
         if (table.offsetWidth > window.innerWidth) {
             tableContainer.style.overflowX = 'auto'; // Enable horizontal scroll if overflow
         } else {
             tableContainer.style.overflowX = 'hidden'; // Hide scroll if no overflow
         }
     }
 });

function calculateHargaAkhir() {
    // Get the values from the input fields
    const hargaAwal = parseFloat(document.getElementById('harga-awal').value) || 0;
    const hargaTT = parseFloat(document.getElementById('harga-tt').value) || 0;

    // Calculate Harga Akhir
    const hargaAkhir = hargaAwal - hargaTT;

    // Set the calculated value to the Harga Akhir input field
    document.getElementById('harga-akhir').value = hargaAkhir;
}

 if ('serviceWorker' in navigator) {
     window.addEventListener('load', () => {
     navigator.serviceWorker.register('/service-worker.js')
         .then((registration) => {
         console.log('ServiceWorker registered: ', registration);
         })
         .catch((registrationError) => {
         console.log('ServiceWorker registration failed: ', registrationError);
         });
     });
 }

  // Event listener untuk tombol reset
document.getElementById('reset-form-btn').addEventListener('click', function() {
    // Ambil semua elemen input dan textarea di form
    const formElements = document.querySelectorAll('#form input, #form textarea');

    // Loop melalui setiap elemen dan hapus properti readOnly
    formElements.forEach(element => {
        element.readOnly = false; // Hapus readOnly
        element.disabled = false; // Pastikan radio buttons juga dapat di-edit kembali
    });

    // Reset form ke kondisi awal
    document.getElementById('form').reset();

    // Kembalikan teks tombol submit ke "Kirim"
    const submitButton = document.getElementById('submit-button');
    submitButton.value = "Kirim";
    submitButton.removeAttribute("data-mode"); // Hapus penanda mode edit
});

                                         
