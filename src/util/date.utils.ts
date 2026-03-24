import moment from 'moment-timezone';

export const formatDate = (date: Date, timezone = 'America/Bogota'): string => {
    return moment(date).tz(timezone).format('YYYY-MM-DD HH:mm:ss');
};

export const getCurrentDate = (): Date => {
    return new Date();
};

export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};
