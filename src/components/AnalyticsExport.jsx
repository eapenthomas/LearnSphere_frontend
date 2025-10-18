import React from 'react';
import { Download, FileText, BarChart3, TrendingUp } from 'lucide-react';

const AnalyticsExport = ({ data, onExport }) => {
  const exportToCSV = () => {
    if (!data) return;
    
    const csvContent = [
      // Headers
      ['Metric', 'Value', 'Period', 'Timestamp'],
      // Stats
      ['Total Students', data.stats?.totalStudents || 0, 'Current', new Date().toISOString()],
      ['Total Courses', data.stats?.totalCourses || 0, 'Current', new Date().toISOString()],
      ['Average Completion', `${data.stats?.avgCompletion || 0}%`, 'Current', new Date().toISOString()],
      ['Total Revenue', `$${data.stats?.totalRevenue || 0}`, 'Current', new Date().toISOString()],
      ['Growth Rate', `${data.stats?.growthRate || 0}%`, 'Current', new Date().toISOString()],
      // Time series data
      ...(data.timeSeries?.map(item => [
        'Daily Enrollments',
        item.enrollments,
        item.date,
        new Date().toISOString()
      ]) || [])
    ];
    
    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teacher-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (!data) return;
    
    const exportData = {
      timestamp: new Date().toISOString(),
      stats: data.stats,
      timeSeries: data.timeSeries,
      coursePerformance: data.coursePerformance,
      engagementRadar: data.engagementRadar
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teacher-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={exportToCSV}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        title="Export to CSV"
      >
        <FileText className="w-4 h-4" />
        <span>CSV</span>
      </button>
      
      <button
        onClick={exportToJSON}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        title="Export to JSON"
      >
        <BarChart3 className="w-4 h-4" />
        <span>JSON</span>
      </button>
    </div>
  );
};

export default AnalyticsExport;
