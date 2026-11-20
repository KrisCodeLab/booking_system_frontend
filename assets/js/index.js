import { requestAPI } from "./apiFetcher.js"

const serviceCards = document.getElementById("serviceCardContainer")
const employeeCards = document.getElementById("employeeCardContainer")
const bookingDate = document.getElementById("bookingDate")
const timeSlots = document.getElementById("timeslotsContainer")
const overviewService = document.getElementById("service")
const overviewEmployee = document.getElementById("employee")
const overviewDate = document.getElementById("date")
const overviewDuration = document.getElementById("duration")
const overviewSum = document.getElementById("sum")

const customerForm = document.getElementById("form")
const customerName = document.getElementById("name")
const customerPhone = document.getElementById("phone")
const customerMail = document.getElementById("mail")

const appointment = {}
let anyEmployee = false

function setTodaysDate() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    bookingDate.value = `${year}-${month}-${day}`

    updateWeekday()
}

function updateWeekday() {
    if (!bookingDate.value) {
        document.getElementById("weekday").textContent = ""
        return
    }

    const date = new Date(`${bookingDate.value}T00:00:00`)

    document.getElementById("weekday").textContent =
        date.toLocaleDateString("de-DE", { weekday: "short" }) + ","
}

async function buildServiceCards() {
    const services = await requestAPI("services", "GET")

    for (const service of services) {
        const duration = service.duration
        const price = service.price / 100

        const serviceCard = document.createElement("div")
        serviceCard.classList.add("serviceCard")

        const serviceName = document.createElement("h3")
        serviceName.innerText = service.service_name

        const serviceDetail = document.createElement("p")
        serviceDetail.innerText = `${duration} Min ⋅ ${price}€`

        serviceCard.append(serviceName, serviceDetail)
        serviceCards.append(serviceCard)
        
        serviceCard.addEventListener("click", async (event) => {
            timeSlots.replaceChildren()

            anyEmployee = false
            appointment.employeeId = undefined
            appointment.employee = undefined
            appointment.date = undefined
            appointment.time = undefined

            appointment.serviceId = service.id
            appointment.serviceName = service.service_name
            appointment.duration = service.duration
            appointment.price = service.price / 100

            buildEmployeeCards(service.id)
        })
    }
}

async function buildEmployeeCards(serviceId) {
    employeeCards.replaceChildren()

    const employees = await requestAPI(`employee/${serviceId}`, "GET")

    const random = document.createElement("p")
    random.innerText = "Egal"
    employeeCards.append(random)

    random.addEventListener("click", async (event) => {
        anyEmployee = true
        appointment.employeeId = undefined
        appointment.employee = undefined
        appointment.date = undefined
        appointment.time = undefined
        buildTimeslots(serviceId)
    })

    for (const employee of employees) {
        const employeeName = document.createElement("p")
        employeeName.innerText = employee.employee_name

        employeeCards.append(employeeName)

        employeeName.addEventListener("click", async (event) => {
            anyEmployee = false
            appointment.employeeId = employee.id
            appointment.employee = employee.employee_name
            appointment.date = undefined
            appointment.time = undefined
            buildTimeslots(serviceId, employee.id)
        })
    }
}

async function buildTimeslots(serviceId, employeeId) {
    timeSlots.replaceChildren()
    let timeSlotsResponse
    
    if (employeeId) {
        timeSlotsResponse = await requestAPI(
            `availability?service_id=${serviceId}&employee_id=${employeeId}&date=${bookingDate.value}`
        )
    } else {
        timeSlotsResponse = await requestAPI(
            `availability?service_id=${serviceId}&date=${bookingDate.value}`
        )
    }

    if (Array.isArray(timeSlotsResponse)) {
        for (const slot of timeSlotsResponse) {
            const timeCard = document.createElement("p")
            timeCard.innerText = slot.time

            timeSlots.append(timeCard)

            timeCard.addEventListener("click", async (event) => {
                if(!employeeId) {
                    const employee = await requestAPI(`employees/${slot.employee_id}`, "GET")
                    appointment.employeeId = employee.id
                    appointment.employee = employee.employee_name
                }

                appointment.date = bookingDate.value
                appointment.time = slot.time
                
                const weekday = document.getElementById("weekday").textContent
                const [year, month, day] = appointment.date.split("-")

                overviewService.innerText = appointment.serviceName
                overviewEmployee.innerText = appointment.employee
                overviewDate.innerText = `${weekday} ${day}.${month}., ${appointment.time}Uhr`
                overviewDuration.innerText = `${appointment.duration} Min`
                overviewSum.innerText = `${appointment.price}€`
            })
        } 
    } else {
        const message = document.createElement("p")
            message.innerText = timeSlotsResponse.message
            message.id = "message"
            timeSlots.append(message)
    }
}

// LISTENER

for (const container of [serviceCards, employeeCards, timeSlots]) {
    container.addEventListener("click", (event) => {
        const card = event.target.closest(".serviceCard, p")

        if (!card || card.parentElement !== container || card.id === "message") {
            return
        }

        for (const previous of container.querySelectorAll(".selected")) {
            previous.classList.remove("selected")
        }

        card.classList.add("selected")
    })
}


bookingDate.addEventListener("change", () => {
    updateWeekday()

    appointment.date = undefined
    appointment.time = undefined

    if (!appointment.serviceId) return

    if (anyEmployee) {
        appointment.employeeId = undefined
        appointment.employee = undefined
        buildTimeslots(appointment.serviceId)
    } else if (appointment.employeeId) {
        buildTimeslots(appointment.serviceId, appointment.employeeId)
    }
})

customerForm.addEventListener("submit", async (event) => {
    event.preventDefault()

    const formData = event.target

    if(
        appointment.serviceId &&
        appointment.employeeId &&
        appointment.date &&
        appointment.time) {
                
            const reqBody = [
                {
                    "service_id": appointment.serviceId,
                    "employee_id": appointment.employeeId,
                    "start_date": `${appointment.date}T${appointment.time}`
                },
                {
                    "customer_name": formData.name.value,
                    "phone": formData.phone.value,
                    "mail": formData.mail.value
                }
            ]

            const response = await fetch("http://127.0.0.1:8080/api/v1/appointment/new", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(reqBody)
            })

            const result = await response.json()

            if (response.ok) {
                localStorage.setItem("bookedAppointment", JSON.stringify(result.appointment))
                customerForm.reset()
                window.location.replace("confirmation.html")
            } else {
                alert(result.message)
            }
        } else {
            alert("Bitte Termindaten vervollständigen.")
        }

})

// APP START
buildServiceCards()
setTodaysDate()
