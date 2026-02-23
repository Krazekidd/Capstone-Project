


/* Profile Image Upload */
document.getElementById('imageUpload').addEventListener('change', function (e) {
    const reader = new FileReader();
    reader.onload = function () {
        document.getElementById('profileImage').src = reader.result;
    }
    reader.readAsDataURL(e.target.files[0]);
});

/* BMI Calculator + Body Animation */
function calculateBMI() {
    let weight = document.getElementById('weight').value;
    let height = document.getElementById('height').value / 100;

    if (weight && height) {
        let bmi = (weight / (height * height)).toFixed(1);
        document.getElementById('bmiResult').innerText = "BMI: " + bmi;

        let body = document.getElementById('bodyVisual');
        body.style.width = (150 + bmi * 2) + "px";
    }
}

/* Chart */
const ctx = document.getElementById('progressChart');
new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Weight Progress',
            data: [85, 82, 80, 78, 77, 75],
            borderColor: '#ff6b00',
            tension: .3
        }]
    }
});

/* Nutri AI */
function sendMessage() {
    let input = document.getElementById('chatInput');
    let chat = document.getElementById('chatBox');

    if (input.value.trim() === "") return;

    chat.innerHTML += "<div><strong>You:</strong> " + input.value + "</div>";

    let reply = "Increase protein intake and maintain hydration.";
    chat.innerHTML += "<div><strong>Nutri-AI:</strong> " + reply + "</div>";

    input.value = "";
    chat.scrollTop = chat.scrollHeight;
}

// Toggle dropdown visibility
const settingsBtn = document.querySelector('.settings-btn');
const settingsMenu = document.querySelector('.settings-menu');

settingsBtn.addEventListener('click', () => {
    settingsMenu.style.display = settingsMenu.style.display === 'block' ? 'none' : 'block';
});

// Close dropdown if clicked outside
document.addEventListener('click', (e) => {
    if (!settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
        settingsMenu.style.display = 'none';
    }
});

// Light/Dark Mode Toggle
function toggleTheme() {
    const body = document.body;
    if (body.style.backgroundColor === 'var(--black)') {
        body.style.backgroundColor = 'var(--light)';
        body.style.color = 'var(--black)';
        document.querySelector('.profile-panel').style.background = 'var(--black)';
        document.querySelectorAll('.badge').forEach(b => b.style.background = 'var(--black)');
    } else {
        body.style.backgroundColor = 'var(--black)';
        body.style.color = 'var(--white)';
        document.querySelector('.profile-panel').style.background = 'var(--white)';
        document.querySelectorAll('.badge').forEach(b => b.style.background = 'var(--orange)');
    }
    settingsMenu.style.display = 'none';
}

