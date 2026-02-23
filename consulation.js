document.addEventListener("DOMContentLoaded", () => {
    let selectedType = "";

    document.querySelectorAll(".type-card").forEach(card => {
        card.addEventListener("click", () => {
            document.querySelectorAll(".type-card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            selectedType = card.dataset.type;
        });
    });

    window.goToStep = function (step) {
        if (step === 2 && !selectedType) {
            alert("Please select a consultation type.");
            return;
        }
        document.querySelectorAll(".consult-card").forEach(c => c.classList.remove("active"));
        document.getElementById(`step${step}`).classList.add("active");

        // Progress bar update
        document.querySelectorAll('.progress-bar .step').forEach((el, index) => {
            if (index < step) el.classList.add('active');
            else el.classList.remove('active');
        });
    }

    window.confirmBooking = function () {
        const date = document.getElementById("date").value;
        const time = document.getElementById("time").value;

        if (!date || !time) {
            alert("Please select a date and time.");
            return;
        }

        document.getElementById("summaryType").textContent = selectedType;
        document.getElementById("summaryDate").textContent = date;
        document.getElementById("summaryTime").textContent = time;

        document.querySelectorAll(".consult-card").forEach(c => c.classList.remove("active"));
        document.getElementById("step3").classList.add("active");

        // Progress bar update
        document.querySelectorAll('.progress-bar .step').forEach((el, index) => {
            if (index < 3) el.classList.add('active');
            else el.classList.remove('active');
        });
    }
});
