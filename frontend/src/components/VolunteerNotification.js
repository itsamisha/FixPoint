import React from 'react';

const VolunteerNotification = ({ notifyVolunteers, setNotifyVolunteers }) => {
  return (
    <div className="form-group">
      <div className="volunteer-option">
        <div className="volunteer-checkbox-wrapper">
          <input
            type="checkbox"
            className="volunteer-checkbox"
            id="volunteer-notification"
            onChange={(e) => setNotifyVolunteers(e.target.checked)}
            checked={notifyVolunteers}
          />
        </div>
        <div className="volunteer-content">
          <label className="volunteer-title" htmlFor="volunteer-notification">
            Notify Community Volunteers
          </label>
          <p className="volunteer-description">
            Check this if you want to notify local volunteers who can help with this issue. Local volunteers will be notified and can offer assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VolunteerNotification;
