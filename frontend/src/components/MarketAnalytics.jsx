import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';
import Toast from './common/Toast';
import ValidateToken from './ValidateToken';
import {
  getMarketArrivalVsPrice,
  getMarketHeatmap,
  getMarketMinMaxModalTrend,
  getMarketPriceTrend,
  getMarketSeasonalTrend,
} from '../api/marketApi';
import { getToken } from '../lib/auth';

const RANGE_PRESETS = [
  { key: '1W', label: '1W', days: 7 },
  { key: '1M', label: '1M', days: 30 },
  { key: '3M', label: '3M', days: 90 },
  { key: '1Y', label: '1Y', days: 365 },
  { key: '3Y', label: '3Y', days: 365 * 3 },
  { key: 'MAX', label: 'Max', days: null },
];

function fmtPrice(value) {
  if (value === null || value === undefined || value === '') return '-';
  return `Rs ${value}`;
}

function fmtCompactNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(value));
}

function fmtMonth(value) {
  if (!value) return '';
  return value.slice(0, 1).toUpperCase() + value.slice(1, 3);
}

function fmtAxisDate(value) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value).slice(5);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function shiftDate(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() - days + 1);
  return date.toISOString().slice(0, 10);
}

function StatCard({ title, value, description, tone = 'primary' }) {
  return (
    <Card className={`market-stat market-stat--${tone}`}>
      <p className="market-stat__title">{title}</p>
      <h3>{value}</h3>
      {description ? <p className="market-stat__desc">{description}</p> : null}
    </Card>
  );
}

function AnalyticsSection({ title, subtitle, children, actions }) {
  return (
    <Card className="market-analytics-card">
      <div className="market-analytics-card__head">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className="market-analytics-card__actions">{actions}</div> : null}
      </div>
      {children}
    </Card>
  );
}

function buildLinePoints(data, accessor, width, height, padding) {
  const values = data.map((item) => Number(accessor(item) ?? 0));
  if (!values.length) return '';

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  return data.map((item, index) => {
    const value = Number(accessor(item) ?? 0);
    const x = padding + (stepX * index);
    const y = height - padding - (((value - min) / range) * (height - padding * 2));
    return `${x},${y}`;
  }).join(' ');
}

function getRangeExtremes(data, keys) {
  const values = data.flatMap((item) => keys.map((key) => Number(item[key]))).filter((value) => !Number.isNaN(value));
  if (!values.length) {
    return { min: null, max: null };
  }
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function LineChart({
  data,
  lines,
  xKey,
  xFormatter = (value) => value,
  compact = false,
  expanded = false,
  interactive = false,
  onPointSelect,
  selectedPointIndex = null,
  hoveredPosition = null,
}) {
  const width = compact ? 700 : 1080;
  const height = compact ? 260 : (expanded ? 640 : 420);
  const padding = 28;
  const allValues = data.flatMap((item) => lines.map((line) => Number(item[line.key] ?? 0))).filter((value) => !Number.isNaN(value));
  const minValue = allValues.length ? Math.min(...allValues) : 0;
  const maxValue = allValues.length ? Math.max(...allValues) : 0;
  const labelStep = data.length <= 10 ? 1 : Math.ceil(data.length / (compact ? 7 : 12));
  const xPositionForIndex = (index) => (data.length > 1 ? padding + (((width - padding * 2) / (data.length - 1)) * index) : width / 2);
  const yPositionForValue = (value) => {
    const range = (maxValue - minValue) || 1;
    return height - padding - ((((Number(value) || 0) - minValue) / range) * (height - padding * 2));
  };

  const selectNearestPoint = (event) => {
    if (!interactive || !data.length || !onPointSelect) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * width;
    const relativeY = ((event.clientY - rect.top) / rect.height) * height;
    const closestIndex = data.reduce((bestIndex, _, index) => {
      const currentDistance = Math.abs(xPositionForIndex(index) - relativeX);
      const bestDistance = Math.abs(xPositionForIndex(bestIndex) - relativeX);
      return currentDistance < bestDistance ? index : bestIndex;
    }, 0);
    onPointSelect({
      index: closestIndex,
      xPercent: ((event.clientX - rect.left) / rect.width) * 100,
      yPercent: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div className="market-chart">
      <div className="market-chart__legend">
        {lines.map((line) => (
          <span key={line.key}>
            <i style={{ background: line.color }} />
            {line.label}
          </span>
        ))}
      </div>
      {data.length ? (
        <div className="market-chart__frame">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className={`market-chart__svg ${interactive ? 'market-chart__svg--interactive' : ''}`}
            role="img"
            aria-label="Market analytics chart"
            onMouseMove={selectNearestPoint}
            onClick={selectNearestPoint}
          >
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#c8d8cd" strokeWidth="1.5" />
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#c8d8cd" strokeWidth="1.5" />
            {[0, 0.5, 1].map((tick) => {
              const y = height - padding - (tick * (height - padding * 2));
              const value = minValue + ((maxValue - minValue) * tick);
              return (
                <g key={tick}>
                  <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e4eee7" strokeDasharray="4 4" />
                  <text x={6} y={y + 4} className="market-chart__tick">{fmtCompactNumber(value)}</text>
                </g>
              );
            })}
            {lines.map((line) => (
              <polyline
                key={line.key}
                fill="none"
                stroke={line.color}
                strokeWidth="3"
                points={buildLinePoints(data, (item) => item[line.key], width, height, padding)}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
            {interactive && selectedPointIndex !== null && data[selectedPointIndex] ? (
              <g>
                <line
                  x1={xPositionForIndex(selectedPointIndex)}
                  y1={padding}
                  x2={xPositionForIndex(selectedPointIndex)}
                  y2={height - padding}
                  stroke="#7aa38f"
                  strokeDasharray="6 6"
                />
                {lines.map((line) => {
                  const selectedValue = data[selectedPointIndex][line.key];
                  if (selectedValue === null || selectedValue === undefined || Number.isNaN(Number(selectedValue))) {
                    return null;
                  }
                  return (
                    <circle
                      key={`${line.key}-selected`}
                      cx={xPositionForIndex(selectedPointIndex)}
                      cy={yPositionForValue(selectedValue)}
                      r="5"
                      fill={line.color}
                      stroke="#fff"
                      strokeWidth="2"
                    />
                  );
                })}
              </g>
            ) : null}
            {data.map((item, index) => {
              if (index !== 0 && index !== data.length - 1 && index % labelStep !== 0) {
                return null;
              }
              const x = data.length > 1 ? padding + (((width - padding * 2) / (data.length - 1)) * index) : width / 2;
              return (
                <text key={`${xKey}-${index}`} x={x} y={height - 8} textAnchor="middle" className="market-chart__label">
                  {xFormatter(item[xKey])}
                </text>
              );
            })}
          </svg>
          {interactive && hoveredPosition && selectedPointIndex !== null && data[selectedPointIndex] ? (
            <div
              className="market-chart__tooltip"
              style={{
                left: `${Math.min(Math.max(hoveredPosition.xPercent, 10), 84)}%`,
                top: `${Math.min(Math.max(hoveredPosition.yPercent - 12, 10), 72)}%`,
              }}
            >
              <strong>{xFormatter(data[selectedPointIndex][xKey])}</strong>
              {lines.map((line) => {
                const value = data[selectedPointIndex][line.key];
                return (
                  <span key={line.key}>
                    <i style={{ background: line.color }} />
                    {line.label}: <b>{fmtCompactNumber(value)}</b>
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="market-analytics-empty">No analytics data available for this range.</div>
      )}
    </div>
  );
}

function HeatmapGrid({ items }) {
  const prices = items.map((item) => Number(item.avgModalPrice ?? 0)).filter((value) => !Number.isNaN(value));
  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : 0;
  const range = max - min || 1;

  return items.length ? (
    <div className="market-heatmap-grid">
      {items.map((item) => {
        const value = Number(item.avgModalPrice ?? 0);
        const intensity = Math.max(0, Math.min(1, (value - min) / range));
        const background = `linear-gradient(135deg, rgba(30, 126, 93, ${0.18 + intensity * 0.45}), rgba(214, 112, 40, ${0.18 + intensity * 0.55}))`;
        return (
          <article key={item.district} className="market-heatmap-item" style={{ background }}>
            <strong>{item.district}</strong>
            <span>{fmtPrice(item.avgModalPrice)}</span>
            <small>{item.marketCount} markets</small>
          </article>
        );
      })}
    </div>
  ) : (
    <div className="market-analytics-empty">No district heatmap data available.</div>
  );
}

export default function MarketAnalytics() {
  const token = getToken();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const commodity = searchParams.get('commodity') || '';
  const state = searchParams.get('state') || '';
  const district = searchParams.get('district') || '';
  const initialFromDate = searchParams.get('fromDate') || '';
  const initialToDate = searchParams.get('toDate') || '';
  const initialPreset = searchParams.get('range') || '1M';

  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const [activePreset, setActivePreset] = useState(initialPreset);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [expandedChart, setExpandedChart] = useState(null);
  const [selectedExpandedPointIndex, setSelectedExpandedPointIndex] = useState(null);
  const [hoveredPointPosition, setHoveredPointPosition] = useState(null);
  const [analytics, setAnalytics] = useState({
    priceTrend: [],
    heatmap: [],
    minMaxModalTrend: [],
    arrivalVsPrice: [],
    seasonalTrend: [],
  });

  const analyticsStats = useMemo(() => {
    const latestTrend = analytics.priceTrend[analytics.priceTrend.length - 1] || null;
    const hottestDistrict = analytics.heatmap[0] || null;
    const highestVolatility = analytics.minMaxModalTrend.reduce((best, item) => {
      if (!best) return item;
      return Number(item.volatility || 0) > Number(best.volatility || 0) ? item : best;
    }, null);
    return { latestTrend, hottestDistrict, highestVolatility };
  }, [analytics]);

  const sectionStats = useMemo(() => ({
    priceTrend: getRangeExtremes(analytics.priceTrend, ['avgMinPrice', 'avgModalPrice', 'avgMaxPrice']),
    minMaxModalTrend: getRangeExtremes(analytics.minMaxModalTrend, ['avgMinPrice', 'avgModalPrice', 'avgMaxPrice', 'volatility']),
    arrivalVsPrice: getRangeExtremes(analytics.arrivalVsPrice, ['avgModalPrice']),
    seasonalTrend: getRangeExtremes(analytics.seasonalTrend, ['avgMinPrice', 'avgModalPrice', 'avgMaxPrice']),
  }), [analytics]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    window.setTimeout(() => setToast({ message: '', type: 'info' }), 2500);
  };

  const runAnalysis = useCallback(async (query) => {
    if (!query.commodity || !query.state || !query.fromDate || !query.toDate) {
      setError('Commodity, state, from date, and to date are required to run analytics.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [priceTrendRes, heatmapRes, minMaxModalRes, arrivalVsPriceRes, seasonalTrendRes] = await Promise.all([
        getMarketPriceTrend(query),
        getMarketHeatmap({ commodity: query.commodity, state: query.state, date: query.toDate }),
        getMarketMinMaxModalTrend(query),
        getMarketArrivalVsPrice(query),
        getMarketSeasonalTrend(query),
      ]);

      setAnalytics({
        priceTrend: priceTrendRes?.data || [],
        heatmap: heatmapRes?.data || [],
        minMaxModalTrend: minMaxModalRes?.data || [],
        arrivalVsPrice: arrivalVsPriceRes?.data || [],
        seasonalTrend: seasonalTrendRes?.data || [],
      });
    } catch {
      setError('Unable to load market analytics right now. Please try again.');
      setAnalytics({
        priceTrend: [],
        heatmap: [],
        minMaxModalTrend: [],
        arrivalVsPrice: [],
        seasonalTrend: [],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!commodity || !state || !fromDate || !toDate) {
      return;
    }
    runAnalysis({ commodity, state, district, fromDate, toDate });
  }, [commodity, state, district, fromDate, toDate, runAnalysis]);

  useEffect(() => {
    if (!expandedChart) {
      return undefined;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [expandedChart]);

  const applyPreset = (preset) => {
    if (!toDate) {
      showToast('Select a valid end date first.', 'info');
      return;
    }

    const nextFromDate = preset.days === null ? initialFromDate || fromDate : shiftDate(toDate, preset.days);
    setActivePreset(preset.key);
    setFromDate(nextFromDate);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('range', preset.key);
    nextParams.set('fromDate', nextFromDate);
    nextParams.set('toDate', toDate);
    setSearchParams(nextParams, { replace: true });
  };

  const handleCustomDateChange = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set(key, value);
    nextParams.set('range', 'CUSTOM');
    setSearchParams(nextParams, { replace: true });
    setActivePreset('CUSTOM');
    if (key === 'fromDate') setFromDate(value);
    if (key === 'toDate') setToDate(value);
  };

  const openExpandedChart = (config) => {
    setExpandedChart(config);
    setSelectedExpandedPointIndex(config?.data?.length ? config.data.length - 1 : null);
    setHoveredPointPosition({ xPercent: 82, yPercent: 20 });
  };

  if (!commodity || !state || !fromDate || !toDate) {
    return (
      <section className="page market-page">
        <ValidateToken token={token} />
        <div className="ag-container">
          <Card className="market-empty">
            Analysis needs market search context first.
            <div className="market-actions" style={{ justifyContent: 'center', marginTop: '14px' }}>
              <Button onClick={() => navigate('/market')}>Back To Market Search</Button>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="page market-page">
      <ValidateToken token={token} />
      <div className="ag-container">
        <header className="market-header market-header--split">
          <div>
            <h1>Market Analysis</h1>
            <p>Deeper crop intelligence for the same search context, with stock-style trend windows and section-by-section analytics.</p>
          </div>
          <div className="market-actions">
            <Button variant="outline" onClick={() => navigate('/market')}>Back To Search</Button>
          </div>
        </header>

        <Card className="market-analysis-hero">
          <div className="market-analysis-hero__copy">
            <span className="market-analysis-hero__eyebrow">Premium Insight Mode</span>
            <h2>{commodity} intelligence for {district || state}</h2>
            <p>Track price behavior like a market terminal: switch ranges, expand charts to full view, and scan the selected-window min/max before making a sell decision.</p>
          </div>
          <div className="market-analysis-hero__metrics">
            <div>
              <strong>{fromDate}</strong>
              <span>Range start</span>
            </div>
            <div>
              <strong>{toDate}</strong>
              <span>Range end</span>
            </div>
            <div>
              <strong>{activePreset}</strong>
              <span>Active window</span>
            </div>
          </div>
        </Card>

        <Card className="market-filter-card market-analysis-toolbar">
          <div className="market-analysis-summary">
            <span><strong>Commodity:</strong> {commodity}</span>
            <span><strong>State:</strong> {state}</span>
            <span><strong>District:</strong> {district || 'All districts'}</span>
          </div>

          <div className="market-analysis-range">
            {RANGE_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                className={`market-range-chip ${activePreset === preset.key ? 'market-range-chip--active' : ''}`}
                onClick={() => applyPreset(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="market-filter-grid market-filter-grid--analysis">
            <div className="market-field">
              <label htmlFor="analysisFromDate">From Date</label>
              <input
                id="analysisFromDate"
                type="date"
                value={fromDate}
                onChange={(e) => handleCustomDateChange('fromDate', e.target.value)}
              />
            </div>

            <div className="market-field">
              <label htmlFor="analysisToDate">To Date</label>
              <input
                id="analysisToDate"
                type="date"
                value={toDate}
                onChange={(e) => handleCustomDateChange('toDate', e.target.value)}
              />
            </div>

            <div className="market-field market-analysis-toolbar__action">
              <label>&nbsp;</label>
              <Button onClick={() => runAnalysis({ commodity, state, district, fromDate, toDate })} loading={loading}>
                Refresh Analysis
              </Button>
            </div>
          </div>
        </Card>

        {error ? <p className="market-error">{error}</p> : null}

        <div className="market-stats-grid market-stats-grid--analytics-page">
          <StatCard
            title="Latest Modal Trend"
            value={fmtPrice(analyticsStats.latestTrend?.avgModalPrice)}
            description={analyticsStats.latestTrend?.date || 'Waiting for analytics'}
            tone="primary"
          />
          <StatCard
            title="Best District"
            value={fmtPrice(analyticsStats.hottestDistrict?.avgModalPrice)}
            description={analyticsStats.hottestDistrict?.district || 'No district data yet'}
            tone="warning"
          />
          <StatCard
            title="Highest Volatility"
            value={fmtPrice(analyticsStats.highestVolatility?.volatility)}
            description={analyticsStats.highestVolatility?.date || 'No volatility data yet'}
            tone="success"
          />
        </div>

        {loading ? (
          <div className="market-loading">
            <div className="ui-spinner ui-spinner--lg" />
            <span>Generating analysis...</span>
          </div>
        ) : (
          <section className="market-analytics market-analytics--stacked">
            <AnalyticsSection
              title="1. Price Trend"
              subtitle="Stock-like view of average min, modal, and max price across the selected range."
              actions={(
                <div className="market-analytics-actions">
                  <div className="market-range-stats">
                    <span>Min Range: <strong>{fmtPrice(sectionStats.priceTrend.min)}</strong></span>
                    <span>Max Range: <strong>{fmtPrice(sectionStats.priceTrend.max)}</strong></span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openExpandedChart({
                    title: 'Price Trend',
                    subtitle: 'Expanded view of average min, modal, and max price.',
                    data: analytics.priceTrend,
                    xKey: 'date',
                    xFormatter: fmtAxisDate,
                    lines: [
                      { key: 'avgMinPrice', label: 'Min', color: '#1f7a53' },
                      { key: 'avgModalPrice', label: 'Modal', color: '#2f5bd3' },
                      { key: 'avgMaxPrice', label: 'Max', color: '#d16f28' },
                    ],
                    stats: sectionStats.priceTrend,
                  })}>
                    Full View
                  </Button>
                </div>
              )}
            >
              <LineChart
                data={analytics.priceTrend}
                xKey="date"
                xFormatter={fmtAxisDate}
                lines={[
                  { key: 'avgMinPrice', label: 'Min', color: '#1f7a53' },
                  { key: 'avgModalPrice', label: 'Modal', color: '#2f5bd3' },
                  { key: 'avgMaxPrice', label: 'Max', color: '#d16f28' },
                ]}
              />
            </AnalyticsSection>

            <AnalyticsSection
              title="2. District Heatmap"
              subtitle={`District-wise price intensity for ${commodity} in ${state}.`}
            >
              <HeatmapGrid items={analytics.heatmap} />
            </AnalyticsSection>

            <AnalyticsSection
              title="3. Min / Max / Modal Trend"
              subtitle="Read spread movement and volatility like a broader technical price range chart."
              actions={(
                <div className="market-analytics-actions">
                  <div className="market-range-stats">
                    <span>Min Range: <strong>{fmtPrice(sectionStats.minMaxModalTrend.min)}</strong></span>
                    <span>Max Range: <strong>{fmtPrice(sectionStats.minMaxModalTrend.max)}</strong></span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openExpandedChart({
                    title: 'Min / Max / Modal Trend',
                    subtitle: 'Expanded spread and volatility view.',
                    data: analytics.minMaxModalTrend,
                    xKey: 'date',
                    xFormatter: fmtAxisDate,
                    lines: [
                      { key: 'avgMinPrice', label: 'Min', color: '#178d5f' },
                      { key: 'avgModalPrice', label: 'Modal', color: '#315ec9' },
                      { key: 'avgMaxPrice', label: 'Max', color: '#c9641e' },
                      { key: 'volatility', label: 'Volatility', color: '#8d3fd1' },
                    ],
                    stats: sectionStats.minMaxModalTrend,
                  })}>
                    Full View
                  </Button>
                </div>
              )}
            >
              <LineChart
                data={analytics.minMaxModalTrend}
                xKey="date"
                xFormatter={fmtAxisDate}
                lines={[
                  { key: 'avgMinPrice', label: 'Min', color: '#178d5f' },
                  { key: 'avgModalPrice', label: 'Modal', color: '#315ec9' },
                  { key: 'avgMaxPrice', label: 'Max', color: '#c9641e' },
                  { key: 'volatility', label: 'Volatility', color: '#8d3fd1' },
                ]}
              />
            </AnalyticsSection>

            <AnalyticsSection
              title="4. Arrival Vs Price"
              subtitle="Supply proxy versus price movement across the same selected trend range."
              actions={(
                <div className="market-analytics-actions">
                  <div className="market-range-stats">
                    <span>Min Price: <strong>{fmtPrice(sectionStats.arrivalVsPrice.min)}</strong></span>
                    <span>Max Price: <strong>{fmtPrice(sectionStats.arrivalVsPrice.max)}</strong></span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openExpandedChart({
                    title: 'Arrival Vs Price',
                    subtitle: 'Expanded view of supply proxy versus modal price.',
                    data: analytics.arrivalVsPrice,
                    xKey: 'date',
                    xFormatter: fmtAxisDate,
                    lines: [
                      { key: 'recordCount', label: 'Records', color: '#1f7a53' },
                      { key: 'marketCount', label: 'Markets', color: '#d16f28' },
                      { key: 'avgModalPrice', label: 'Modal Price', color: '#2f5bd3' },
                    ],
                    stats: sectionStats.arrivalVsPrice,
                  })}>
                    Full View
                  </Button>
                </div>
              )}
            >
              <LineChart
                data={analytics.arrivalVsPrice}
                xKey="date"
                xFormatter={fmtAxisDate}
                lines={[
                  { key: 'recordCount', label: 'Records', color: '#1f7a53' },
                  { key: 'marketCount', label: 'Markets', color: '#d16f28' },
                  { key: 'avgModalPrice', label: 'Modal Price', color: '#2f5bd3' },
                ]}
              />
            </AnalyticsSection>

            <AnalyticsSection
              title="5. Seasonal Trend"
              subtitle="Monthly average behavior for the selected analysis window."
              actions={(
                <div className="market-analytics-actions">
                  <div className="market-range-stats">
                    <span>Min Range: <strong>{fmtPrice(sectionStats.seasonalTrend.min)}</strong></span>
                    <span>Max Range: <strong>{fmtPrice(sectionStats.seasonalTrend.max)}</strong></span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openExpandedChart({
                    title: 'Seasonal Trend',
                    subtitle: 'Expanded monthly average behavior.',
                    data: analytics.seasonalTrend,
                    xKey: 'monthName',
                    xFormatter: (value) => fmtMonth(String(value || '')),
                    lines: [
                      { key: 'avgMinPrice', label: 'Min', color: '#1f7a53' },
                      { key: 'avgModalPrice', label: 'Modal', color: '#2f5bd3' },
                      { key: 'avgMaxPrice', label: 'Max', color: '#d16f28' },
                    ],
                    stats: sectionStats.seasonalTrend,
                  })}>
                    Full View
                  </Button>
                </div>
              )}
            >
              <LineChart
                data={analytics.seasonalTrend}
                xKey="monthName"
                xFormatter={(value) => fmtMonth(String(value || ''))}
                lines={[
                  { key: 'avgMinPrice', label: 'Min', color: '#1f7a53' },
                  { key: 'avgModalPrice', label: 'Modal', color: '#2f5bd3' },
                  { key: 'avgMaxPrice', label: 'Max', color: '#d16f28' },
                ]}
              />
            </AnalyticsSection>
          </section>
        )}
      </div>
      {expandedChart ? (
        <div className="market-fullscreen-overlay" role="dialog" aria-modal="true" onClick={() => setExpandedChart(null)}>
          <div className="market-fullscreen-card" onClick={(event) => event.stopPropagation()}>
            <div className="market-fullscreen-card__head">
              <div>
                <h2>{expandedChart.title}</h2>
              </div>
              <div className="market-fullscreen-card__actions">
                <div className="market-range-stats">
                  <span>Min Range: <strong>{fmtPrice(expandedChart.stats?.min)}</strong></span>
                  <span>Max Range: <strong>{fmtPrice(expandedChart.stats?.max)}</strong></span>
                </div>
                <Button variant="outline" onClick={() => setExpandedChart(null)}>Close</Button>
              </div>
            </div>
            <LineChart
              data={expandedChart.data}
              xKey={expandedChart.xKey}
              xFormatter={expandedChart.xFormatter}
              lines={expandedChart.lines}
              compact={false}
              expanded
              interactive
              hoveredPosition={hoveredPointPosition}
              selectedPointIndex={selectedExpandedPointIndex}
              onPointSelect={({ index, xPercent, yPercent }) => {
                setSelectedExpandedPointIndex(index);
                setHoveredPointPosition({ xPercent, yPercent });
              }}
            />
          </div>
        </div>
      ) : null}
      <Toast message={toast.message} type={toast.type} />
    </section>
  );
}
