// Longitudinal comparisons use one full calendar month per observation.
window.EPF_CALENDAR = {
  monthIndex(isoDate) {
    const [year, month] = isoDate.split('-').map(Number);
    return 12 * year + month - 1;
  },
  monthlyVintages(vintages) {
    return vintages.filter(({start, end}) => {
      if (!start.endsWith('-01')) return false;
      const [year, month] = start.split('-').map(Number);
      const monthEnd = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
      return end === monthEnd;
    }).sort((a, b) => a.end.localeCompare(b.end));
  }
};
