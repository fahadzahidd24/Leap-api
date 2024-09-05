export function calculatePAS(
  salesTargets,
  averageCaseSize,
  numberOfWeeks,
  prospectingApproach,
  appointmentsKept,
  salesSubmitted
) {
  const total_cases = salesTargets / averageCaseSize;
  const cases_per_week = total_cases / numberOfWeeks;

  const temp_daily = {
    p_weekly: Math.ceil(cases_per_week * prospectingApproach),
    a_weekly: Math.ceil(cases_per_week * appointmentsKept),
    s_weekly: Math.ceil(cases_per_week * salesSubmitted),
  };
  const daily_goals = {
    p_daily: Math.round(temp_daily.p_weekly / 5),
    a_daily: Math.round(temp_daily.a_weekly / 5),
    s_daily: Math.round(temp_daily.s_weekly / 5),
  };
  const weekly_goals = {
    p_weekly: Math.round(daily_goals.p_daily * 5),
    a_weekly: Math.round(daily_goals.a_daily * 5),
    s_weekly: Math.round(daily_goals.s_daily * 5),
  };

  return { daily_goals, weekly_goals };
}
