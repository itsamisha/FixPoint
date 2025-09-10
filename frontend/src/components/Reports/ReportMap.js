import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ReportMap = ({ reports, center, zoom = 13, height = '400px', onMarkerClick }) => {
  // Ensure center coordinates are valid, fallback to Dhaka, Bangladesh
  const validCenter = center && center[0] !== undefined && center[1] !== undefined 
    ? center 
    : [23.8103, 90.4125]; // Dhaka, Bangladesh

  const getMarkerColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'submitted': return '#fbbf24'; // yellow
      case 'in_progress': return '#3b82f6'; // blue
      case 'resolved': return '#10b981'; // green
      case 'rejected': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const createCustomIcon = (status) => {
    const color = getMarkerColor(status);
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  const formatCategory = (category) => {
    return category?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer 
        center={validCenter} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {reports && reports.map((report) => {
          // Check if coordinates are valid numbers
          const lat = parseFloat(report.latitude);
          const lng = parseFloat(report.longitude);
          const hasValidCoords = !isNaN(lat) && !isNaN(lng) && 
                                lat >= -90 && lat <= 90 && 
                                lng >= -180 && lng <= 180;
          
          return hasValidCoords ? (
          <Marker
            key={report.id}
            position={[lat, lng]}
            icon={createCustomIcon(report.status)}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(report);
                }
              }
            }}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
                  {report.title || 'Untitled Report'}
                </h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>
                  {formatCategory(report.category)}
                </p>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px' }}>
                  {report.description ? (
                    <>
                      {report.description.substring(0, 100)}
                      {report.description.length > 100 ? '...' : ''}
                    </>
                  ) : 'No description available'}
                </p>
                <div style={{ fontSize: '11px', color: '#888' }}>
                  Status: <span style={{ 
                    color: getMarkerColor(report.status), 
                    fontWeight: 'bold' 
                  }}>
                    {report.status?.replace(/_/g, ' ') || 'Unknown'}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                  Votes: {report.voteCount || 0} | Comments: {report.commentCount || 0}
                </div>
              </div>
            </Popup>
          </Marker>
          ) : null;
        })}
      </MapContainer>
    </div>
  );
};

export default ReportMap;
