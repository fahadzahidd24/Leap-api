const getCurrentDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const getStartOfWeek = (date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
};

// Helper function to get the end of the week (Saturday) for a given date
const getEndOfWeek = (date) => {
    const endOfWeek = new Date(date);
    const day = endOfWeek.getDay();
    const diff = endOfWeek.getDate() + (6 - day);
    endOfWeek.setDate(diff);
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
};

export { getCurrentDate, getStartOfWeek, getEndOfWeek } 