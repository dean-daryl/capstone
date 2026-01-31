export const getDateRange = (range) => {
    const now = new Date();
  
    switch (range) {
      case "lastWeek":
        const lastWeekStart = new Date(now);
        lastWeekStart.setDate(now.getDate() - 7);
        return {
          startDate: lastWeekStart.toISOString(),
          endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        };
  
      case "thisMonth":
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          startDate: thisMonthStart.toISOString(),
          endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        };
  
      case "today":
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        return {
          startDate: todayStart.toISOString(),
          endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        };
  
      case "thisQuarter":
        const currentQuarter = Math.floor((now.getMonth() + 3) / 3);
        const thisQuarterStart = new Date(
          now.getFullYear(),
          (currentQuarter - 1) * 3,
          1
        );
        return {
          startDate: thisQuarterStart.toISOString(),
          endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        };
  
      case "yesterday":
        const yesterdayStart = new Date(now);
        yesterdayStart.setDate(now.getDate() - 1);
        yesterdayStart.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(yesterdayStart);
        yesterdayEnd.setHours(23, 59, 59, 999);
        return {
          startDate: yesterdayStart.toISOString(),
          endDate: yesterdayEnd.toISOString(),
        };
  
      case "last7Days":
        const last7DaysEnd = new Date(now);
        last7DaysEnd.setDate(now.getDate() - 2); 
        last7DaysEnd.setHours(23, 59, 59, 999); 
        const last7DaysStart = new Date(last7DaysEnd);
        last7DaysStart.setDate(last7DaysEnd.getDate() - 6);
        last7DaysStart.setHours(0, 0, 0, 0);
        return {
          startDate: last7DaysStart.toISOString(),
          endDate: last7DaysEnd.toISOString(),
        };
        
      case "last30Days":
        const last30DaysEnd = new Date(now);
        last30DaysEnd.setDate(now.getDate() - 7);
        last30DaysEnd.setHours(23, 59, 59, 999);
        const last30DaysStart = new Date(last30DaysEnd);
        last30DaysStart.setDate(last30DaysEnd.getDate() - 23);
        last30DaysStart.setHours(0, 0, 0, 0);
        return {
          startDate: last30DaysStart.toISOString(),
          endDate: last30DaysEnd.toISOString(),
        };
  
      default:
        throw new Error("Invalid range specified");
    }
  };
  