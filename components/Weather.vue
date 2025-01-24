<template>
    <div class="weather">
        Columbia, SC - {{ currentTime }}
        <template v-if="weather">
             - 
            {{ weather.temperature }}°F ({{ weather.condition }})
        </template>
    </div>
</template>

<script setup>

    const weather = ref(null)
    const currentTime = ref("")

    // Fetch weather data from the server endpoint
    const fetchWeather = async () => {
        try {
            const response = await fetch('/api/weather')
            const data = await response.json()

            if (data && !data.error) {
                weather.value = {
                    temperature: data.current.temp_f,
                    condition: data.current.condition.text
                }
            } else {
                console.error('Error fetching weather:', data.error)
            }
        } catch (error) {
            console.error('Fetch error:', error)
        }
    }

    // Update current time every second
    const updateTime = () => {
        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/New_York",
            hour: "2-digit",
            minute: "2-digit",
        })
        currentTime.value = formatter.format(new Date())
    }

    onMounted(() => {
        updateTime()
        fetchWeather()
        setInterval(updateTime, 1000)
    })
</script>

<style lang="less" scoped>
    .weather {
        gap: 15px;
        width: 100%;
        display: flex;
        color: #738496;
        font-size: 11px;
        font-weight: 800;
        align-items: center;
        font-family: monospace;

        @media (max-width: 800px) { 
            text-align: center;
            align-items: center;
            justify-content: center;
        }
    }
</style>