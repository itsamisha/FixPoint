import React, { useState } from 'react';
import { Download, FileText, CheckSquare, Calendar, User, Building } from 'lucide-react';
import { toast } from 'react-toastify';
import { reportService } from '../services/reportService';

const ReportExporter = ({ 
  selectedReports = [], 
  allReports = [], 
  userRole = 'citizen',
  onExportComplete = () => {},
  isExportMode = false,
  onExportModeChange = () => {}
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeImages: true,
    includeComments: true,
    includeProgress: true,
    includeMetadata: true,
    format: 'detailed', // 'detailed' or 'summary'
    dateRange: 'all' // 'all', 'week', 'month', 'custom'
  });

  const handleExportButtonClick = () => {
    if (!isExportMode) {
      // First click: Activate export mode
      onExportModeChange(true);
    } else {
      // Already in export mode: Show options modal
      setShowExportOptions(true);
    }
  };

  const handleExportSelected = async () => {
    if (selectedReports.length === 0) {
      toast.error('Please select at least one report to export');
      return;
    }

    console.log('Starting export for reports:', selectedReports);
    console.log('Export options:', exportOptions);

    setIsExporting(true);
    try {
      const response = await reportService.exportReportsToPDF(selectedReports, exportOptions);
      console.log('Export response:', response);
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reports_export_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Successfully exported ${selectedReports.length} report(s) to PDF`);
      onExportComplete();
      setShowExportOptions(false);
      onExportModeChange(false); // Reset export mode after export
    } catch (error) {
      console.error('Export error details:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Failed to export reports. Please try again.';
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Export feature not available. Please check if the backend is running.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error during export. Please try again later.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = async () => {
    if (allReports.length === 0) {
      toast.error('No reports available to export');
      return;
    }

    setIsExporting(true);
    try {
      const allReportIds = allReports.map(report => report.id);
      const response = await reportService.exportReportsToPDF(allReportIds, exportOptions);
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `all_reports_export_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Successfully exported ${allReports.length} report(s) to PDF`);
      onExportComplete();
      setShowExportOptions(false);
      onExportModeChange(false); // Reset export mode after export
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export reports. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSingleReportExport = async (reportId) => {
    setIsExporting(true);
    try {
      const response = await reportService.exportSingleReportToPDF(reportId, exportOptions);
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report_${reportId}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Report exported to PDF successfully');
      onExportComplete();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="report-exporter">
      {/* Main Export Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleExportButtonClick}
          disabled={isExporting}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Download size={16} />
          {!isExportMode ? 'Export to PDF' : (isExporting ? 'Exporting...' : 'Configure Export')}
        </button>
        
        {isExportMode && (
          <button
            onClick={() => {
              onExportModeChange(false);
              setShowExportOptions(false);
            }}
            className="btn btn-outline flex items-center gap-2"
          >
            Cancel
          </button>
        )}
        
        {selectedReports.length > 0 && isExportMode && (
          <span className="text-sm text-gray-600">
            ({selectedReports.length} selected)
          </span>
        )}
      </div>

      {/* Export Options Modal */}
      {showExportOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText size={24} className="text-blue-600" />
                </div>
                PDF Export Options
              </h3>
              <button
                onClick={() => {
                  setShowExportOptions(false);
                  onExportModeChange(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <span className="text-gray-400 hover:text-gray-600 text-xl">✕</span>
              </button>
            </div>

            {/* Export Options */}
            <div className="space-y-6 mb-8">
              {/* Content Selection */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <CheckSquare size={16} className="text-blue-600" />
                  Include in Export:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeImages}
                      onChange={(e) => setExportOptions({...exportOptions, includeImages: e.target.checked})}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Images</span>
                      <span className="text-xs text-gray-500">📷</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeComments}
                      onChange={(e) => setExportOptions({...exportOptions, includeComments: e.target.checked})}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Comments</span>
                      <span className="text-xs text-gray-500">💬</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeProgress}
                      onChange={(e) => setExportOptions({...exportOptions, includeProgress: e.target.checked})}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-xs text-gray-500">📊</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeMetadata}
                      onChange={(e) => setExportOptions({...exportOptions, includeMetadata: e.target.checked})}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Metadata</span>
                      <span className="text-xs text-gray-500">🏷️</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Format Selection */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  Export Format:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value="detailed"
                      checked={exportOptions.format === 'detailed'}
                      onChange={(e) => setExportOptions({...exportOptions, format: e.target.value})}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Detailed Report</span>
                      <p className="text-xs text-gray-500">Complete information with all selected content</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value="summary"
                      checked={exportOptions.format === 'summary'}
                      onChange={(e) => setExportOptions({...exportOptions, format: e.target.value})}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Summary Only</span>
                      <p className="text-xs text-gray-500">Basic information and key details</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Export Actions */}
            <div className="flex flex-col gap-2">
              {selectedReports.length > 0 && (
                <button
                  onClick={handleExportSelected}
                  disabled={isExporting}
                  className="w-full btn btn-primary flex items-center justify-center gap-2"
                >
                  <CheckSquare size={16} />
                  Export Selected ({selectedReports.length})
                </button>
              )}
              
              <button
                onClick={handleExportAll}
                disabled={isExporting}
                className="w-full btn btn-secondary flex items-center justify-center gap-2"
              >
                <FileText size={16} />
                Export All Reports ({allReports.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Quick export button for individual reports
export const QuickExportButton = ({ reportId, className = "" }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleQuickExport = async () => {
    setIsExporting(true);
    try {
      const response = await reportService.exportSingleReportToPDF(reportId, {
        includeImages: true,
        includeComments: true,
        includeProgress: true,
        includeMetadata: true,
        format: 'detailed'
      });
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report_${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Report exported to PDF');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleQuickExport}
      disabled={isExporting}
      className={`flex items-center gap-1 text-sm ${className}`}
      title="Export this report to PDF"
    >
      <Download size={14} />
      {isExporting ? 'Exporting...' : 'PDF'}
    </button>
  );
};

export default ReportExporter;
