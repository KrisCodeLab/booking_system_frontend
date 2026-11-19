export async function requestAPI(apiparams, method) {
    try {
        const response = await fetch(`http://127.0.0.1:8080/api/v1/${apiparams}`, {
            method: method,
        })
        if (!response.ok)
            throw new Error("Fehler beim Response")
        const data = await response.json()
        return data
    } catch(error) {
        console.error(error)
    }
}