import { requestAPI } from "./apiFetcher.js"

const selectedDate = document.getElementById("selectedDate")
const previousDayButton = document.getElementById("previousDay")
const nextDayButton = document.getElementById("nextDay")
const todayButton = document.getElementById("today")
const employeeColumns = document.querySelectorAll(".employeeColumn")

let currentDate = new Date()

function updateSelectedDate() {
    const weekday = currentDate.toLocaleDateString("de-DE", {
        weekday: "short"
    }).replace(".", "")

    selectedDate.innerText = `${weekday}, ${currentDate.toLocaleDateString("de-DE")}`
}

async function buildAppointments() {
    updateSelectedDate()

    for (const column of employeeColumns) {
        column.replaceChildren()
    }

    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, "0")
    const day = String(currentDate.getDate()).padStart(2, "0")
    const date = `${year}-${month}-${day}`

    const appointments = await requestAPI(`appointments?date=${date}`, "GET")
    if (appointments === undefined) return

    // Eine ältere Antwort nach einem weiteren Datumswechsel ignorieren.
    if (date !== `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`) return

    for (const appointment of appointments) {
        const start = new Date(appointment.start_date)
        const end = new Date(appointment.end_date)

        const startMinutes = start.getHours() * 60 + start.getMinutes()
        const duration = (end.getTime() - start.getTime()) / 60000
        const startRow = (startMinutes - 9 * 60) / 5 + 1
        const rows = duration / 5

        const appointmentCard = document.createElement("div")
        appointmentCard.classList.add("appointment", `start-${startRow}`, `duration-${rows}`)

        if (appointment.appointment_status_id === 1) {
            appointmentCard.classList.add("booked")
        } else if (appointment.appointment_status_id === 2) {
            appointmentCard.classList.add("completed")
        } else if (appointment.appointment_status_id === 3) {
            appointmentCard.classList.add("noShow")
        } else if (appointment.appointment_status_id === 4) {
            appointmentCard.classList.add("cancelled")
        }

        const title = document.createElement("strong")
        title.innerText = `${appointment.service_name} · ${appointment.customer_name}`

        const startTime = start.toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit"
        })
        const endTime = end.toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit"
        })

        const details = document.createElement("span")
        details.innerText = `${startTime}–${endTime}`

        appointmentCard.append(title, details)

        const column = document.getElementById(String(appointment.employee_id))
        column.append(appointmentCard)
    }
}

// LISTENER
previousDayButton.addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() - 1)
    buildAppointments()
})

nextDayButton.addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() + 1)
    buildAppointments()
})

todayButton.addEventListener("click", () => {
    currentDate = new Date()
    buildAppointments()
})

// APP START
buildAppointments()