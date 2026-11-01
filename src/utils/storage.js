// LocalStorage manager for Cinematron state: Profiles, My List, Likes, Progress

import { PROFILES } from '../data/catalog.js';

const STORAGE_KEYS = {
  CURRENT_PROFILE: 'cinematron_profile_id',
  PROFILES_CUSTOM: 'cinematron_profiles_data',
  MY_LIST: 'cinematron_my_list_',
  LIKES: 'cinematron_likes_',
  MUTED: 'cinematron_muted'
};

export const storage = {
  getAllProfiles() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILES_CUSTOM);
      return data ? JSON.parse(data) : PROFILES;
    } catch {
      return PROFILES;
    }
  },

  getCurrentProfile() {
    const profiles = this.getAllProfiles();
    const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE);
    const profile = profiles.find(p => p.id === savedId);
    return profile || profiles[0];
  },

  setCurrentProfile(profileId) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE, profileId);
    window.dispatchEvent(new CustomEvent('cinematron:profile-changed', { detail: { profileId } }));
  },

  updateProfile(profileId, updates) {
    const profiles = this.getAllProfiles().map(p => {
      if (p.id === profileId) {
        return { ...p, ...updates };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.PROFILES_CUSTOM, JSON.stringify(profiles));
    window.dispatchEvent(new CustomEvent('cinematron:profile-changed', { detail: { profileId } }));
  },

  getMyList(profileId = null) {
    const pid = profileId || this.getCurrentProfile().id;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MY_LIST + pid);
      return data ? JSON.parse(data) : ['c-01', 'c-02', 'c-07']; // Default starting list
    } catch {
      return ['c-01', 'c-02', 'c-07'];
    }
  },

  isInMyList(itemId, profileId = null) {
    const list = this.getMyList(profileId);
    return list.includes(itemId);
  },

  toggleMyList(itemId, profileId = null) {
    const pid = profileId || this.getCurrentProfile().id;
    let list = this.getMyList(pid);
    let added = false;
    if (list.includes(itemId)) {
      list = list.filter(id => id !== itemId);
      added = false;
    } else {
      list = [itemId, ...list];
      added = true;
    }
    localStorage.setItem(STORAGE_KEYS.MY_LIST + pid, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('cinematron:list-updated', { detail: { itemId, added, list } }));
    return added;
  },

  getLikes(profileId = null) {
    const pid = profileId || this.getCurrentProfile().id;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LIKES + pid);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  setLike(itemId, status, profileId = null) { // status: 'like' | 'dislike' | null
    const pid = profileId || this.getCurrentProfile().id;
    const likes = this.getLikes(pid);
    if (status === null || likes[itemId] === status) {
      delete likes[itemId];
    } else {
      likes[itemId] = status;
    }
    localStorage.setItem(STORAGE_KEYS.LIKES + pid, JSON.stringify(likes));
    window.dispatchEvent(new CustomEvent('cinematron:like-updated', { detail: { itemId, status } }));
    return likes[itemId] || null;
  }
};
