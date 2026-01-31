export const formatDate = (date) => {
    const pad = (num) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T` +
           `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.716`;
  };
