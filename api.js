(function (global) {
  'use strict';

  const API_BASE = 'https://flautcloud-auth.stekolnikov0310.workers.dev/api';
  const USE_MOCK = false;

  function request(path, options) {
    const opts = options || {};
    return fetch(API_BASE + path, {
      method: opts.method || 'GET',
      headers: Object.assign({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }, opts.headers || {}),
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      credentials: 'include',
      mode: 'cors',
      cache: 'no-store'
    }).then(function (res) {
      if (!res.ok) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          throw new Error(data.error || ('Ошибка ' + res.status));
        });
      }
      return res.json();
    });
  }

  const FlautAPI = {
    authenticate: function (telegramUser) {
      return request('/auth/telegram', {
        method: 'POST',
        body: { id_token: telegramUser.id_token }
      });
    },

    logout: function () {
      return request('/auth/logout', { method: 'POST' });
    },

    getSession: function () {
      return request('/auth/session');
    },

    getFiles: function () {
      return request('/files');
    },

    deleteFile: function (id) {
      return request('/files/' + encodeURIComponent(id), { method: 'DELETE' });
    },

    createTeam: function (payload) {
      return request('/team', { method: 'POST', body: payload });
    },

    getTeam: function () {
      return request('/team');
    },

    addMember: function (username) {
      return request('/team/members', {
        method: 'POST',
        body: { username: username }
      });
    },

    removeMember: function (userId) {
      return request('/team/members/' + encodeURIComponent(userId), { method: 'DELETE' });
    },

    getStorage: function () {
      return request('/storage');
    },

    getNotifications: function () {
      return request('/notifications');
    },

    markNotificationsRead: function () {
      return request('/notifications/read', { method: 'POST' });
    }
  };

  global.FlautAPI = FlautAPI;
})(window);