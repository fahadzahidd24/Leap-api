export function calculatePAS(
    salesTargets,
    averageCaseSize,
    numberOfWeeks,
    prospectingApproach,
    appointmentsKept,
    salesSubmitted,
) {
    const total_cases = Math.floor(salesTargets / averageCaseSize);
    const cases_per_week = Math.floor(total_cases / numberOfWeeks);

    const weekly_goals = {
        p_weekly: cases_per_week * prospectingApproach,
        a_weekly: cases_per_week * appointmentsKept,
        s_weekly: cases_per_week * salesSubmitted,
    };
    const daily_goals = {
        p_daily: Math.ceil(weekly_goals.p_weekly / 5),
        a_daily: Math.ceil(weekly_goals.a_weekly / 5),
        s_daily: Math.ceil(weekly_goals.s_weekly / 5),
    };

    return { daily_goals, weekly_goals };
}
