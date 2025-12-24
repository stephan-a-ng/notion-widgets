import { useState, useCallback, useEffect } from 'react';
import { AIRTABLE_API_URL, AIRTABLE_TOKEN } from '../config/constants';

export function useUsageData() {
  const [usageData, setUsageData] = useState({
    percentage: 0,
    refreshEpoch: null,
    history: [],
    isLoading: true
  });

  const fetchUsageData = useCallback(async () => {
    if (!AIRTABLE_API_URL || !AIRTABLE_TOKEN) {
      return;
    }

    try {
      // Fetch records with usage data, sorted by created time descending
      const response = await fetch(
        `${AIRTABLE_API_URL}?sort[0][field]=Created&sort[0][direction]=desc&maxRecords=100`,
        {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_TOKEN}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Airtable fetch failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.records && data.records.length > 0) {
        // Get the most recent record with usage data
        const latestWithUsage = data.records.find(r =>
          r.fields['TASKLET_USAGE_PERCENTAGE'] !== undefined
        );

        if (latestWithUsage) {
          const refreshEpoch = latestWithUsage.fields['TASKLET_REFRESH_EPOCH'];
          const refreshDate = refreshEpoch ? new Date(refreshEpoch * 1000) : null;

          // Get all records since the last refresh for history
          const history = data.records
            .filter(r => {
              if (!r.fields['TASKLET_USAGE_PERCENTAGE']) return false;
              if (!refreshEpoch) return true;
              const recordTime = new Date(r.createdTime).getTime() / 1000;
              return recordTime >= refreshEpoch;
            })
            .map(r => ({
              percentage: r.fields['TASKLET_USAGE_PERCENTAGE'],
              timestamp: new Date(r.createdTime)
            }))
            .reverse(); // Oldest first for graphing

          setUsageData({
            percentage: latestWithUsage.fields['TASKLET_USAGE_PERCENTAGE'] || 0,
            refreshEpoch: refreshDate,
            history,
            isLoading: false
          });
        } else {
          setUsageData(prev => ({ ...prev, isLoading: false }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch usage data:', error);
      setUsageData(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Calculate if usage is healthy based on consumption rate
  const getHealthStatus = useCallback(() => {
    const { percentage, refreshEpoch, history } = usageData;

    // Under 25% is always green
    if (percentage < 25) return 'healthy';

    // If we have refresh epoch, calculate time until refresh
    if (refreshEpoch) {
      const now = new Date();
      const msUntilRefresh = refreshEpoch.getTime() - now.getTime();
      const hoursUntilRefresh = msUntilRefresh / (1000 * 60 * 60);

      // If refresh is in the past, we're healthy (will refresh soon)
      if (hoursUntilRefresh <= 0) return 'healthy';

      // Calculate consumption rate from history
      if (history.length >= 2) {
        const oldest = history[0];
        const newest = history[history.length - 1];
        const timeDiffHours = (newest.timestamp - oldest.timestamp) / (1000 * 60 * 60);
        const percentageDiff = newest.percentage - oldest.percentage;

        if (timeDiffHours > 0 && percentageDiff > 0) {
          const ratePerHour = percentageDiff / timeDiffHours;
          const remainingPercentage = 100 - percentage;
          const hoursUntilFull = remainingPercentage / ratePerHour;

          // If we'll refresh before hitting 100%, we're healthy
          if (hoursUntilRefresh < hoursUntilFull) return 'healthy';
        }
      }

      // Between 25-75% is warning
      if (percentage < 75) return 'warning';
    }

    // Over 75% or can't calculate is danger
    return percentage >= 75 ? 'danger' : 'warning';
  }, [usageData]);

  useEffect(() => {
    fetchUsageData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUsageData, 30000);
    return () => clearInterval(interval);
  }, [fetchUsageData]);

  return {
    ...usageData,
    healthStatus: getHealthStatus(),
    refresh: fetchUsageData
  };
}
