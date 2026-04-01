export const isSessionLive = (date, timeSlot) => {
    if (!date || !timeSlot) return false

    const now = new Date()
    const [startStr, endStr] = timeSlot.split(' - ')

    const dateBase = new Date(date).toLocaleDateString('en-CA')

    const sessionStart = new Date(`${dateBase} ${startStr}`)
    const sessionEnd = new Date(`${dateBase} ${endStr}`)

    return now>= sessionStart && now<sessionEnd
}