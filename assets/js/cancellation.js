import { requestAPI } from "./apiFetcher.js"

const cancellationForm = document.getElementById("form")

cancellationForm.addEventListener("submit", async (event) => {
    event.preventDefault()

    const formData = event.target

    const response = await fetch(
        `http://127.0.0.1:8080/api/v1/appointment/cancel/${formData.token.value}`,
        {
            method: "PATCH"
        }
    )

    const result = await response.json()

    if (response.ok) {
        localStorage.setItem("cancelResult", JSON.stringify(result))
        cancellationForm.reset()
        window.location.replace("cancelConfirmation.html")
    } else {
        alert(result.message)
    }
})