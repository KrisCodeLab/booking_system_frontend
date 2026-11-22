export async function requestAPI(apiparams, method) {
    try {
        const response = await fetch(`http://127.0.0.1:8080/api/v1/${apiparams}`, {
            method: method,
        })
        const data = await response.json()
        if (!response.ok)
            throw new Error(data.message || "Die Anfrage ist fehlgeschlagen.")
        return data
    } catch(error) {
        console.error(error)
        alert(error.message)
    }
}