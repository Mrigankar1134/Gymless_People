type ReportCallback = (metric: { name: string; value: number }) => void;

const reportWebVitals = (onPerfEntry?: ReportCallback) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then((webVitals) => {
      // Only use onCLS which is available in web-vitals v5
      webVitals.onCLS(onPerfEntry);
    });
  }
};

export default reportWebVitals;
