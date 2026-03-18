// WHITELIST
const groupMembers = [
    "aryakesit4@gmail.com",
    "awan.panjer@gmail.com",
    "hasanul766@gmail.com",
    "khawaydin@gmail.com",
    "ahmadyaqdhan123@gmail.com"
];

const headerHTML = `
    <header>
        <div class="header-top">
            <h1>Bingung Namanya Apa</h1>
            
            <div id="auth-section" class="auth-section">
                <div id="buttonDiv"></div> 
                
                <div id="user-info" class="user-info">
                    <span id="user-name-display" class="user-name"></span>
                    <span id="user-role" style="font-size: 0.9em; font-weight: bold;"></span>
                    
                    <div id="theme-controls" style="display: none; align-items: center; gap: 10px; border-left: 2px solid #ccc; padding-left: 15px; margin-left: 5px;">
                        <label for="color-picker" style="font-size: 0.9em;">Warna:</label>
                        <input type="color" id="color-picker" value="#faebd7" style="cursor: pointer;">
                        
                        <label for="font-select" style="font-size: 0.9em;">Font:</label>
                        <select id="font-select" style="cursor: pointer; padding: 2px;">
                            <option value="'Comic Sans MS', sans-serif">Comic Sans</option>
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="'Times New Roman', serif">Times New Roman</option>
                            <option value="'Courier New', monospace">Courier New</option>
                        </select>
                    </div>

                    <button id="logout-btn" class="logout-btn">Logout</button>
                </div>
            </div>
        </div>

        <div class="nav">
            <div class="flex-bar" id="nav-links">
                <a href="index.html">Home</a>
                <a href="tk2-ahmad.html">Ahmad</a>
                <a href="tk2-arya.html">Arya</a>
                <a href="tk2-aydin.html">Aydin</a>
                <a href="tk2-hasan.html">Hasan</a>
                <a href="tk2-wawan.html">Wawan</a>
            </div>
        </div>
    </header>
`;

document.addEventListener("DOMContentLoaded", function() {
    // HTML injection untuk header
    const placeholder = document.getElementById("header-placeholder");
    if (placeholder) {
        placeholder.innerHTML = headerHTML;
    }

    // Navbar Active State
    const currentPage = window.location.pathname.split("/").pop(); 
    const navLinks = document.querySelectorAll("#nav-links a");
    navLinks.forEach(link => {
        const linkHref = link.getAttribute("href");
        if (linkHref === currentPage || (currentPage === "" && linkHref === "index.html")) {
            link.removeAttribute("href"); 
        }
    });

    // Cek session login saat halaman dimuat
    const savedUser = localStorage.getItem('loggedInUser');
    if (savedUser) {
        // Jika ada session, parse data dan langsung terapkan UI Login
        const userObj = JSON.parse(savedUser);
        applyUserSession(userObj.email, userObj.name);
    } else {
        // Jika tidak ada session, siapkan tombol Google Login
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initGoogleSignIn; 
        document.head.appendChild(script);
    }

    // Event listener logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Event listener untuk mengubah dan menyimpan tema web
    document.getElementById('color-picker').addEventListener('input', function(e) {
        const newColor = e.target.value;
        document.body.style.backgroundColor = newColor;
        localStorage.setItem('savedColor', newColor); // Simpan warna ke localStorage
    });

    document.getElementById('font-select').addEventListener('change', function(e) {
        const newFont = e.target.value;
        document.body.style.fontFamily = newFont;
        localStorage.setItem('savedFont', newFont); // Simpan font ke localStorage
    });

    // Terapkan tema yang tersimpan saat halaman dimuat
    const savedColor = localStorage.getItem('savedColor');
    const savedFont = localStorage.getItem('savedFont');
    if (savedColor) {
        document.body.style.backgroundColor = savedColor;
        document.getElementById('color-picker').value = savedColor;
    }
    if (savedFont) {
        document.body.style.fontFamily = savedFont;
        document.getElementById('font-select').value = savedFont;
    }
});

// Fungsi inisialisasi Google
function initGoogleSignIn() {
    google.accounts.id.initialize({
        client_id: "112761146436-4448jf1vi9bpa9qg9t6p21urut9o1dt0.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
    
    google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large", type: "standard" }
    );
}

// Fungsi setelah berhasil login dari Google
function handleCredentialResponse(response) {
    const responsePayload = decodeJwtResponse(response.credential);
    const userEmail = responsePayload.email;
    const userName = responsePayload.name;
    
    // Simpan session ke localStorage
    localStorage.setItem('loggedInUser', JSON.stringify({ email: userEmail, name: userName }));

    // Terapkan UI
    applyUserSession(userEmail, userName);
}

// Fungsi untuk menerapkan UI setelah login
function applyUserSession(userEmail, userName) {
    document.getElementById('buttonDiv').style.display = 'none';
    document.getElementById('user-info').style.display = 'flex';
    document.getElementById('user-name-display').innerText = `Halo, ${userName}`;

    const roleBadge = document.getElementById('user-role');
    const themeControls = document.getElementById('theme-controls');

    if (groupMembers.includes(userEmail)) {
        // ADMIN - Anggota Kelompok
        roleBadge.innerText = '(Admin)';
        roleBadge.style.color = 'green';
        themeControls.style.display = 'flex';
    } else {
        // GUEST
        roleBadge.innerText = '(Guest)';
        roleBadge.style.color = 'red';
        themeControls.style.display = 'none';
    }
}

// Fungsi Logout
function handleLogout() {
    // Hapus session dari localStorage
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('savedColor'); // Hapus tema tersimpan
    localStorage.removeItem('savedFont');
    
    // Refresh halaman untuk mereset state
    window.location.reload();
}

function decodeJwtResponse(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}