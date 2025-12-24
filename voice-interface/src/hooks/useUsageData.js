import { useState, useCallback, useEffect, useRef } from 'react';
import { AIRTABLE_TELEMETRY_URL, AIRTABLE_TOKEN } from '../config/constants';

const USAGE_CACHE_KEY = 'voice-interface-usage-cache';

// Load cached usage data from localStorage
function loadCachedUsageData() {
  try {
    const cached = localStorage.getItem(USAGE_CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      return {
        percentage: data.percentage || 0,
        refreshEpoch: data.refreshEpoch ? new Date(data.refreshEpoch) : null,
        history: (data.history || []).map(h => ({
          ...h,
          timestamp: new Date(h.timestamp)
        })),
        isLoading: false
      };
    }
  } catch (e) {
    console.error('Failed to load cached usage data:', e);
  }
  return null;
}

// Save usage data to localStorage
function saveCachedUsageData(data) {
  try {
    localStorage.setItem(USAGE_CACHE_KEY, JSON.stringify({
      percentage: data.percentage,
      refreshEpoch: data.refreshEpoch?.toISOString(),
      history: data.history.map(h => ({
        percentage: h.percentage,
        timestamp: h.timestamp.toISOString()
      }))
    }));
  } catch (e) {
    console.error('Failed to save usage cache:', e);
  }
}

export function useUsageData() {
  // Initialize with cached data or defaults (not loading state)
  const [usageData, setUsageData] = useState(() => {
    const cached = loadCachedUsageData();
    return cached || {
      percentage: 0,
      refreshEpoch: null,
      history: [],
      isLoading: false
    };
  });
  const [justUpdated, setJustUpdated] = useState(false);
  const previousPercentageRef = useRef(null);

  const fetchUsageData = useCallback(async () => {
    if (!AIRTABLE_TELEMETRY_URL || !AIRTABLE_TOKEN) {
      console.warn('Airtable telemetry not configured');
      setUsageData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      // Fetch telemetry records - table uses key-value format with Mnemonics and Value fields
      const response = await fetch(
        `${AIRTABLE_TELEMETRY_URL}?maxRecords=100`,
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
      console.log('Telemetry response:', data);

      if (data.records && data.records.length > 0) {
        // Separate records by mnemonic type and sort by created time
        const usageRecords = data.records
          .filter(r => r.fields['Mnemonics'] === 'TASKLET_USAGE_PERCENTAGE')
          .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));

        const epochRecords = data.records
          .filter(r => r.fields['Mnemonics'] === 'TASKLET_REFRESH_EPOCH')
          .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));

        // Get latest values
        const latestUsage = usageRecords[0];
        const latestEpoch = epochRecords[0];

        if (latestUsage) {
          const newPercentage = latestUsage.fields['Value'] || 0;
          const refreshEpochValue = latestEpoch?.fields['Value'];
          const refreshDate = refreshEpochValue ? new Date(refreshEpochValue * 1000) : null;

          // Check if percentage changed - trigger pulse
          if (previousPercentageRef.current !== null &&
              previousPercentageRef.current !== newPercentage) {
            setJustUpdated(true);
            setTimeout(() => setJustUpdated(false), 1500);
          }
          previousPercentageRef.current = newPercentage;

          // Get all usage records for history (component will filter by period)
          const history = usageRecords
            .map(r => ({
              percentage: r.fields['Value'],
              timestamp: new Date(r.createdTime)
            }))
            .reverse(); // Oldest first for graphing

          const newData = {
            percentage: newPercentage,
            refreshEpoch: refreshDate,
            history,
            isLoading: false
          };
          setUsageData(newData);
          saveCachedUsageData(newData);

          console.log('Usage data:', { percentage: newPercentage, refreshDate, historyCount: history.length });
        } else {
          console.log('No TASKLET_USAGE_PERCENTAGE records found');
          setUsageData(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        console.log('No telemetry records found');
        setUsageData(prev => ({ ...prev, isLoading: false }));
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
    justUpdated,
    refresh: fetchUsageData
  };
}
