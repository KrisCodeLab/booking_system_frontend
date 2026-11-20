const overviewService = document.getElementById("service")
const overviewEmployee = document.getElementById("employee")
const overviewDate = document.getElementById("date")
const overviewDuration = document.getElementById("duration")
const overviewPrice = document.getElementById("price")
const overviewCustomer = document.getElementById("customer")
const overviewToken = document.getElementById("token")

const appointment = JSON.parse(localStorage.getItem("bookedAppointment"))

if (appointment) {
    const [date, time] = appointment.start_date.split("T")
    const [year, month, day] = date.split("-")

    overviewService.innerText = appointment.service_name
    overviewEmployee.innerText = appointment.employee_name
    overviewDate.innerText = `${day}.${month}.${year}, ${time.slice(0, 5)} Uhr`
    overviewDuration.innerText = `${appointment.duration} Min`
    overviewPrice.innerText = `${appointment.price / 100}€`
    overviewCustomer.innerText = appointment.customer_name
    overviewToken.innerText = appointment.token
} else {
    document.getElementById("message").innerText = "Keine Buchung vorhanden."
}
