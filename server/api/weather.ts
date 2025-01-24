export default defineEventHandler(async () => {

    // Access the runtime config
    const config = useRuntimeConfig()
    const apiKey = config.weatherApiKey

    // Hard-coded API URL and query parameters
    const aqi = 'no'
    const location = '29203'
    const apiUrl = 'http://api.weatherapi.com/v1/current.json'

    // Construct the full API URL
    const url = `${apiUrl}?key=${apiKey}&q=${location}&aqi=${aqi}`

    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`)
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error(error)
        return { error: error || 'Failed to fetch weather data' }
    }
})