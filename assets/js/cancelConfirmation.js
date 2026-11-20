const message = document.getElementById("message")

const result = JSON.parse(localStorage.getItem("cancelResult"))

if (result) {
    message.innerText = result.message
} else {
    message.innerText = "Keine Stornierung vorhanden."
}
