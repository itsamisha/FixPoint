import api from "./api";

export const volunteerService = {
  // Get volunteer leaderboard
  getVolunteerLeaderboard: () => {
    return api.get("/api/volunteers/leaderboard");
  },

  // Get all volunteers
  getAllVolunteers: () => {
    return api.get("/api/volunteers");
  },

  // Get volunteer statistics
  getVolunteerStats: (volunteerId) => {
    return api.get(`/api/volunteers/${volunteerId}/stats`);
  },
};
