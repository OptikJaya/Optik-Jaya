let laporanSemuaSales = [];
let refreshing = false;

// Cache DOM elements at the top of your script
const loginContainer = document.getElementById('login-container');
const formContainer = document.getElementById('form-container');
const menuContainer = document.getElementById('menu-container');
const userInfoBtn = document.getElementById('user-info-btn');
const logoutBtn = document.getElementById('logout-btn');
const tableContainer = document.querySelector('.table-container');
const submitButton = document.getElementById('submit-button');
const loadingIndicator = document.getElementById('loading-indicator');
const searchViewInput = document.getElementById('search-view-input');
const dataViewContainer = document.getElementById('data-view-container')
const paymentSummaryContainer = document.getElementById('payment-summary-container')
const monthlyReportContainer = document.getElementById('monthly-report-container')
const semuaSalesContainer = document.getElementById('semua-sales-container')

// Constants
const SHEET_ID = '1-Appfrc9S7RzJZO5aq4oxn73FtaOregvL3vOzpGJf6M';
const API_KEY = 'AIzaSyCMf51O_3RxFirEV1lzzwzGZtISqnrAfB0';
const KODE_UTAMA = 'https://script.google.com/macros/s/AKfycbzoVbKjpxqTO0bkZ3BQ35mCho0wWzbpaLZf9FSnCDBQ7A7wlRRoFqSQoGp8AdazOeQE/exec';


function toggleVisibility(showElement, hideElement) {
    showElement.style.display = 'block';
    hideElement.style.display = 'none';
}

// Function to handle logout
function handleLogout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    toggleVisibility(loginContainer, formContainer);
    location.reload();
}

// Function to run when the window loads
window.onload = function () {
    if (localStorage.getItem('loggedIn') === 'true') {
        const username = localStorage.getItem('username');
        const role = localStorage.getItem('role'); // Ambil role yang tersimpan
        
        if (username) {
            const menuHeader = document.querySelector('#menu-container h2');
            menuHeader.textContent = 'Hai, ' + username + '!';
            userInfoBtn.textContent = username;
            toggleVisibility(menuContainer, loginContainer);
            formContainer.style.display = 'none';
            
            // Tampilkan atau sembunyikan menu laporan semua sales berdasarkan role
            const allSalesReportBtn = document.getElementById('all-sales-report-btn');
            if (role === 'admin') {
                allSalesReportBtn.style.display = 'block'; // Tampilkan untuk admin
            } else {
                allSalesReportBtn.style.display = 'none'; // Sembunyikan untuk role lain
            }
        }
    } else {
        toggleVisibility(loginContainer, menuContainer);
        formContainer.style.display = 'none';
    }
    resetTimer();
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

    fetch('https://script.google.com/macros/s/AKfycbwjvsy2rLsXu7nSEZALPNsndiE64slRr3nkIt9paC4-lJeHsBdYp6IJRCsl1RgO2zI5/exec') // Ganti dengan URL Apps Script Anda
        .then(response => response.json())
        .then(credentials => {
            const user = credentials.find(user => user.username === username && user.password === password);
            if (user) {
                handleLoginSuccess(user.username, user.role); // Tambahkan role saat login sukses
            } else {
                alert('Akun salah, coba lagi.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Gagal masuk, coba lagi nanti.');
        });
}

// Function to handle login success
function handleLoginSuccess(username, role) {
    console.log('User role:', role);  // Add this line to check the role
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('username', username);
    localStorage.setItem('role', role); // Store the role
    userInfoBtn.textContent = username;
    toggleVisibility(menuContainer, loginContainer);

    if (role === 'admin') {
        document.getElementById('all-sales-report-btn').style.display = 'block';
    } else {
        document.getElementById('all-sales-report-btn').style.display = 'none'; // Hide the button for non-admin users
    }
}


// Attach login event to the form
document.getElementById('login-form').addEventListener('submit', login);

 // Handle the menu buttons for navigating
 document.getElementById('fill-form-btn').addEventListener('click', function() {
    toggleVisibility(formContainer,menuContainer)
 });

 // Event listener for the show data button
 document.getElementById('show-data-btn').addEventListener('click', function() {
     document.getElementById('menu-container').style.display = 'none'; // Hide the menu
     fetchSheetData(); // Call the function to fetch data and display it
 });

 
 // Fetch user-specific data from Google Sheets
 function fetchSheetData() {
     const loggedInUser = localStorage.getItem('username'); // Get the logged-in user's username
     const sheetRanges = [`${loggedInUser}!A1:AL`]; // Ensure the username is the correct sheet name
     const rangesQuery = sheetRanges.map(range => `ranges=${encodeURIComponent(range)}`).join('&');

     const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchGet?${rangesQuery}&key=${API_KEY}`;

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

    const headers = data[0];
    let tableHtml = `<table border="1"><thead><tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr></thead><tbody>`;

    data.slice(1).forEach((row, index) => {
        const rowId = index + 2; // Row ID for reference
        tableHtml += `<tr data-row-id="${rowId}">
            ${row.map((cell, cellIndex) => {
                // Assuming "Name" is the first column (index 0)
                if (cellIndex === 0) {
                    return `<td><button id="Nama-detail" class="Nama-detail" onclick="showActionButtons(${rowId})">${cell || ''}</button></td>`;
                } else {
                    return `<td>${cell || ''}</td>`;
                }
            }).join('')}
        </tr>`;
    });

    tableHtml += '</tbody></table>';
    tableContainer.innerHTML = tableHtml;

    makeTableSortable('table-container');
}

function showActionButtons(rowId) {
    const actionButtons = document.getElementById('action-buttons');
    actionButtons.style.display = 'block';
    
    // Save the selected rowId for use in editRow and viewDetails functions
    actionButtons.setAttribute('data-row-id', rowId);
    
    // Remove 'selected-name' class from any previously selected cell
    const previouslySelected = document.querySelector('.selected-name');
    if (previouslySelected) {
        previouslySelected.classList.remove('selected-name');
    }
    
    // Add 'selected-name' class to the newly selected Name cell
    const nameCell = document.querySelector(`tr[data-row-id="${rowId}"] td:first-child`);
    if (nameCell) {
        nameCell.classList.add('selected-name');
    }
}


function editRow() {
    // Get the rowId from the action buttons container
    const rowId = document.getElementById('action-buttons').getAttribute('data-row-id');

    // Use rowId to locate the target row
    const row = document.querySelector(`tr[data-row-id="${rowId}"]`);
    const cells = row.querySelectorAll('td');

    document.getElementById('row-id').value = rowId; // Set Row ID in hidden input

    const formElements = [
        { id: 'name', cellIndex: 0 },
        { id: 'address', cellIndex: 1 },
        { id: 'age', cellIndex: 2 },
        { id: 'phone', cellIndex: 3 },
        { id: 'Status Pelanggan', cellIndex: 4, type: 'radio' },
        { id: 'coordinates', cellIndex: 5 },
        { id: 'lensa', cellIndex: 6, type: 'radio' },
        { id: 'frame', cellIndex: 7, type: 'radio' },
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
    toggleVisibility(formContainer,dataViewContainer)
    
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
    toggleVisibility(menuContainer,dataViewContainer)
 });

 function viewDetails() {
    // Retrieve the rowId from the action buttons container
    const rowId = document.getElementById('action-buttons').getAttribute('data-row-id');
    
    // Use rowId to locate the target row
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
    toggleVisibility(paymentSummaryContainer,dataViewContainer)
}

document.getElementById('back-to-data-btn').addEventListener('click', function() {
    toggleVisibility(menuContainer,dataViewContainer)
});

document.getElementById('back-to-menu-from-summary-btn').addEventListener('click', function() {
    toggleVisibility(menuContainer,paymentSummaryContainer)
});

// Toggle visibility for Laporan Bulananku menu
document.getElementById('monthly-report-btn').addEventListener('click', function() {
    toggleVisibility(monthlyReportContainer, menuContainer);
    // Don't call loadReportByMonth here unless you intend for it to load immediately
});

document.getElementById('back-to-menu-from-report-btn').addEventListener('click', function() {
    toggleVisibility(menuContainer,monthlyReportContainer)
});

document.addEventListener('DOMContentLoaded', function () {
    const startYear = 2022;
    const endYear = 2040;
    const currentYear = new Date().getFullYear();

    // Populate years for Monthly Report
    const yearSelectMonthly = document.getElementById('select-year-monthly');
    for (let year = startYear; year <= endYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelectMonthly.appendChild(option);
    }
    if (currentYear >= startYear && currentYear <= endYear) {
        yearSelectMonthly.value = currentYear;
    } else {
        yearSelectMonthly.value = startYear;
    }

    // Populate years for All Sales Monthly Report
    const yearSelectAllSales = document.getElementById('select-year-allsales');
    for (let year = startYear; year <= endYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelectAllSales.appendChild(option);
    }
    if (currentYear >= startYear && currentYear <= endYear) {
        yearSelectAllSales.value = currentYear;
    } else {
        yearSelectAllSales.value = startYear;
    }
});


// Function to load the monthly report from Google Apps Script
function loadReportByMonth() {
    const bulan = document.getElementById('select-month-monthly').value;
    const tahun = document.getElementById('select-year-monthly').value;

    if (!bulan || !tahun) {
        alert("Silakan pilih bulan dan tahun.");
        return;
    }

    const username = localStorage.getItem('username');

    // Tampilkan loading
    showLoading('loading-monthly-report');

    fetch(`${KODE_UTAMA}?bulan=${bulan}&tahun=${tahun}&username=${username}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.laporan) {
                displayReportData(data.laporan); // Display the data in the table
            } else {
                alert("Data laporan tidak ditemukan.");
            }
        })
        .catch(error => {
            console.error('Error fetching monthly report:', error);
            alert("Error saat memuat laporan.");
        })
        .finally(() => {
            // Sembunyikan loading
            hideLoading('loading-monthly-report');
        });
}

// Function to display report data in HTML table
function displayReportData(laporan) {
    const tableBody = document.getElementById('report-table-body');
    tableBody.innerHTML = ''; // Clear previous content

    let totalOmset = 0;
    let totalKacamata = 0;

    laporan.forEach((item, index) => {
        const row = `<tr>
            <td>${index + 1}</td>
            <td>${item.namaPelanggan}</td>
            <td>${item.alamat}</td>
            <td>${item.tanggalTransaksi}</td>
            <td>${item.jumlahKacamata}</td>
            <td>Rp${item.jumlahUang.toLocaleString()}</td>
        </tr>`;
        tableBody.insertAdjacentHTML('beforeend', row);
        
        // Tambahkan ke total omset dan jumlah kacamata
        totalOmset += item.jumlahUang;
        totalKacamata += item.jumlahKacamata;
    });

    // Display total omset and total kacamata in the footer
    document.getElementById('total-omset').textContent = 'Rp' + totalOmset.toLocaleString();
    document.getElementById('total-kacamata').textContent = totalKacamata;

    makeTableSortable('monthly-report-container');
}

// Fungsi untuk memuat laporan bulanan semua sales
function loadAllSalesMonthlyReport() {
    const bulan = document.getElementById('select-month-allsales').value;
    const tahun = document.getElementById('select-year-allsales').value;

    // Tampilkan loading
    showLoading('loading-all-sales-report');

    fetch(`${KODE_UTAMA}?bulan=${bulan}&tahun=${tahun}&semuaSales=true`)
        .then(response => response.json())
        .then(data => {
            if (data && data.laporan) {
                laporanSemuaSales = data.laporan;
                displayAllSalesReportData(laporanSemuaSales);
            } else {
                alert("Data laporan tidak ditemukan.");
            }
        })
        .catch(error => {
            console.error('Error fetching all sales monthly report:', error);
            alert("Error saat memuat laporan bulanan semua sales.");
        })
        .finally(() => {
            // Sembunyikan loading
            hideLoading('loading-all-sales-report');
        });
}

document.getElementById('back-to-menu-from-semua-sales-btn').addEventListener('click', function() {
    toggleVisibility(menuContainer,semuaSalesContainer)
});

// Fungsi untuk menampilkan data laporan semua sales di HTML table
function displayAllSalesReportData(laporanSemuaSales) {
    const tableBody = document.getElementById('semua-sales-table-body');
    tableBody.innerHTML = ''; // Clear previous content

    let totalOmset = 0;
    let totalKacamata = 0;

    laporanSemuaSales.forEach((salesReport, index) => {
        const jumlahKacamata = salesReport.jumlahKacamata || 0;
        const jumlahUang = salesReport.jumlahUang || 0;

        const row = `<tr>
            <td>${index + 1}</td>
            <td><button onclick="showSalespersonDetails('${index}')">${salesReport.sales}</button></td>
            <td>${salesReport.laporan.length} transactions</td>
            <td>${jumlahKacamata}</td>
            <td>Rp${jumlahUang.toLocaleString()}</td>
        </tr>`;
        tableBody.insertAdjacentHTML('beforeend', row);

        // Accumulate totals
        totalOmset += jumlahUang;
        totalKacamata += jumlahKacamata;
    });

    // Update the total elements in the footer
    document.getElementById('total-omset-semua').textContent = 'Rp' + totalOmset.toLocaleString();
    document.getElementById('total-kacamata-semua').textContent = totalKacamata;
}


document.getElementById('all-sales-report-btn').addEventListener('click', function() {
    toggleVisibility(semuaSalesContainer, menuContainer);
});

function showSalespersonDetails(salespersonIndex) {
    const selectedSalesperson = laporanSemuaSales[salespersonIndex];
    const tableBody = document.getElementById('report-table-body');
    tableBody.innerHTML = ''; // Clear previous content

    selectedSalesperson.laporan.forEach((transaction, index) => {
        const row = `<tr>
            <td>${index + 1}</td>
            <td>${transaction.namaPelanggan}</td>
            <td>${transaction.alamat}</td>
            <td>${transaction.tanggalTransaksi}</td>
            <td>${transaction.jumlahKacamata}</td>
            <td>Rp${transaction.jumlahUang.toLocaleString()}</td>
        </tr>`;
        tableBody.insertAdjacentHTML('beforeend', row);
    });

    // Toggle the visibility to show details
    toggleVisibility(document.getElementById('monthly-report-container'), document.getElementById('semua-sales-container'));
}

window.addEventListener('popstate', function (event) {
    // Periksa elemen yang sedang aktif untuk menentukan ke mana Back harus membawa pengguna
    if (dataViewContainer.style.display === 'block') {
        // Jika sedang di data view, kembalikan ke menu utama
        toggleVisibility(menuContainer, dataViewContainer);
    } else if (formContainer.style.display === 'block') {
        // Jika sedang di form, kembali ke menu utama
        toggleVisibility(menuContainer, formContainer);
    } else if (monthlyReportContainer.style.display === 'block') {
        // Jika sedang di laporan bulanan, kembali ke menu utama
        toggleVisibility(menuContainer, monthlyReportContainer);
    } else if (semuaSalesContainer.style.display === 'block') {
        // Jika sedang di laporan semua sales, kembali ke menu utama
        toggleVisibility(menuContainer, semuaSalesContainer);
    } else if (paymentSummaryContainer.style.display === 'block') {
        // Jika sedang di rincian pembayaran, kembali ke menu utama
        toggleVisibility(menuContainer, paymentSummaryContainer);
    } else {
        // Jika tidak ada konteks yang sesuai, kembali ke tampilan login atau keluar dari aplikasi
        toggleVisibility(loginContainer, menuContainer);
    }
});

// Fungsi untuk menambahkan state ke riwayat browser saat beralih halaman
function navigateToSection(showElement, hideElement) {
    toggleVisibility(showElement, hideElement);
    history.pushState(null, null, location.href); // Tambah riwayat baru tanpa reload halaman
}

function makeTableSortable(tableContainerId) {
    const tableContainer = document.getElementById(tableContainerId);
    if (!tableContainer) return;

    const table = tableContainer.querySelector('table');
    if (!table) return;

    const headers = table.querySelectorAll('thead th');
    const sortDirections = Array(headers.length).fill(null); // Track sorting state for each column

    headers.forEach((header, columnIndex) => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            // Toggle sort direction
            const currentDirection = sortDirections[columnIndex];
            const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
            sortDirections[columnIndex] = newDirection;

            // Sort table
            sortTable(table, columnIndex, newDirection);

            // Tambahkan panah untuk menunjukkan arah sort
            headers.forEach(h => h.textContent = h.textContent.replace(/ ↑| ↓/g, '')); // Hapus panah dari header lain
            header.textContent += newDirection === 'asc' ? ' ↑' : ' ↓'; // Tambahkan panah baru
        });
    });
}

function sortTable(table, columnIndex, direction = 'asc') {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    const isNumeric = !isNaN(parseFloat(rows[0].cells[columnIndex]?.textContent || ''));

    const sortedRows = rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex]?.textContent.trim() || '';
        const cellB = rowB.cells[columnIndex]?.textContent.trim() || '';

        const comparison = isNumeric
            ? parseFloat(cellA) - parseFloat(cellB)
            : cellA.localeCompare(cellB);

        return direction === 'asc' ? comparison : -comparison;
    });

    sortedRows.forEach(row => tbody.appendChild(row));

    // Tambahkan kelas sorted ke header yang di-sort
    const headers = table.querySelectorAll('thead th');
    headers.forEach(h => h.classList.remove('sorted-asc', 'sorted-desc'));
    headers[columnIndex].classList.add(direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
}


document.addEventListener('DOMContentLoaded', () => {
    makeTableSortable('semua-sales-container'); // For Semua Sales table
});

function showLoading(containerId) {
    const loadingElement = document.getElementById(containerId);
    loadingElement.style.display = 'flex'; // Menampilkan loading
}

function hideLoading(containerId) {
    const loadingElement = document.getElementById(containerId);
    loadingElement.style.display = 'none'; // Menyembunyikan loading
}



 // Toggle Password Visibility
 document.getElementById('togglePassword').addEventListener('change', function() {
     const passwordInput = document.getElementById('password');
     passwordInput.type = this.checked ? 'text' : 'password';
 });

 // Declare logoutTimer at the top of the script
let logoutTimer;

// Function to reset the inactivity timer
function resetTimer() {
    clearTimeout(logoutTimer);  // Clear the previous timer
    logoutTimer = setTimeout(logout, inactivityLimit);  // Reset the timer
}

// Inactivity limit in milliseconds (e.g., 10 minutes)
const inactivityLimit = 10 * 60 * 1000; // Set inactivity limit to 10 minutes

// Function to handle logout due to inactivity
function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    toggleVisibility(loginContainer, formContainer); // Show login form
    toggleVisibility(loginContainer, menuContainer);
    alert('You have been logged out due to inactivity.');
}

// Start the inactivity timer if the user is logged in
if (localStorage.getItem('loggedIn') === 'true') {
    resetTimer();  // Start the inactivity timer
}

// Listen for user activity to reset the timer
window.addEventListener('mousemove', resetTimer);
window.addEventListener('keypress', resetTimer);
window.addEventListener('click', resetTimer);
window.addEventListener('touchstart', resetTimer);  // For mobile users


 // Automatically show the form if the user is already logged in
 if (localStorage.getItem('loggedIn') === 'true') {
    toggleVisibility(formContainer,loginContainer)
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

function toggleOtherInput(inputName, otherInputId) {
    const radioButtons = document.querySelectorAll(`input[name="${inputName}"]`);
    const otherInput = document.getElementById(otherInputId);

    radioButtons.forEach(button => {
        button.addEventListener('change', function() {
            if (this.value === 'Other') {
                otherInput.style.display = 'block';
                otherInput.addEventListener('input', () => {
                    this.value = otherInput.value; // Update the radio button's value dynamically
                });
            } else {
                otherInput.style.display = 'none';
                otherInput.value = ''; // Clear the text field when another option is selected
            }
        });
    });
}

// Initialize the toggle functionality for "lensa" and "frame"
toggleOtherInput('lensa', 'lensa-other-text');
toggleOtherInput('frame', 'frame-other-text');



document.getElementById('back-to-menu-btn').addEventListener('click', function() {
    toggleVisibility(menuContainer,formContainer)
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


// Handle service worker updates
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
            // Check for updates every 5 minutes
            setInterval(() => {
                registration.update();
            }, 5 * 60 * 1000);

            // Listen for new service worker installation
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New version available, trigger refresh
                        if (!refreshing) {
                            refreshing = true;
                            // Save any important state/data here if needed
                            window.location.reload();
                        }
                    }
                });
            });
        });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', event => {
        if (event.data.type === 'UPDATE_AVAILABLE') {
            console.log(`New version ${event.data.version} is available`);
            if (!refreshing) {
                refreshing = true;
                // Save any important form data or state here
                window.location.reload();
            }
        }
    });

    // Handle reload behavior
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });
}
