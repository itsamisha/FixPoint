import React from 'react';

const DuplicateWarningModal = ({ 
  show, 
  duplicates, 
  onCancel, 
  onProceed, 
  loading,
  formatEnumValue 
}) => {
  if (!show) return null;

  return (
    <div className="duplicate-modal-overlay">
      <div className="duplicate-modal">
        <div className="duplicate-modal-header">
          <h3>⚠️ Potential Duplicate Reports Found</h3>
          <p>We found {duplicates.length} similar report(s) that might be the same issue. Please review them before proceeding.</p>
        </div>
        
        <div className="duplicate-modal-content">
          {duplicates.map((duplicate) => (
            <div key={duplicate.id} className="duplicate-item">
              <div className="duplicate-info">
                <h4>{duplicate.title}</h4>
                <p className="duplicate-description">{duplicate.description}</p>
                <div className="duplicate-meta">
                  <span className="duplicate-category">{formatEnumValue(duplicate.category)}</span>
                  <span className="duplicate-status">{formatEnumValue(duplicate.status)}</span>
                  <span className="duplicate-similarity">{duplicate.similarity}% similar</span>
                  <span className="duplicate-date">
                    Reported on {new Date(duplicate.createdAt).toLocaleDateString()}
                  </span>
                  <span className="duplicate-reporter">by {duplicate.reporter}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="duplicate-modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel Submission
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onProceed}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Anyway"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateWarningModal;
