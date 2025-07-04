import axios from 'axios';
import { Warning, WarningSettings, NotificationPayload, UserProfile, EmergencyContact, EmergencyAlert } from './types/warning';
const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('[API Error]', error.response || error.message);
    return Promise.reject(error);
  }
);

export async function getBatteryStatus() {
    const response = await api.get('/items/battery');
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Error fetching battery status: ${response.statusText}`);
    }
}

export async function getJointsStatus() {
    const response = await api.get('/items/joints');
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Error fetching joints status: ${response.statusText}`);
    }
}

export async function getTasks() {
    const response = await api.get('/items/tasks');
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Error fetching tasks: ${response.statusText}`);
    }
}

// 警告系统相关API
export async function getWarnings(): Promise<Warning[]> {
    const response = await api.get('/warnings');
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Error fetching warnings: ${response.statusText}`);
    }
}

export async function getWarningSettings(): Promise<WarningSettings> {
    const response = await api.get('/warnings/settings');
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Error fetching warning settings: ${response.statusText}`);
    }
}

export async function updateWarningSettings(settings: Partial<WarningSettings>): Promise<WarningSettings> {
    const response = await api.patch('/warnings/settings', settings);
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Error updating warning settings: ${response.statusText}`);
    }
}

export async function resolveWarning(warningId: string): Promise<void> {
    const response = await api.patch(`/warnings/${warningId}/resolve`);
    if (response.status !== 200) {
        throw new Error(`Error resolving warning: ${response.statusText}`);
    }
}

export async function getRobotStatus(): Promise<{ online: boolean; lastSeen: string }> {
    const response = await api.get('/robot/status');
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Error fetching robot status: ${response.statusText}`);
    }
}

export async function testNotification(): Promise<void> {
    const response = await api.post('/warnings/test-notification');
    if (response.status !== 200) {
        throw new Error(`Error testing notification: ${response.statusText}`);
    }
}

// 用户配置相关API
export async function getUserProfile(): Promise<UserProfile> {
    const response = await api.get('/user/profile');
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Error fetching user profile: ${response.statusText}`);
    }
}

export async function updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const response = await api.patch('/user/profile', profile);
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Error updating user profile: ${response.statusText}`);
    }
}

export async function addEmergencyContact(contact: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {
    const response = await api.post('/user/emergency-contacts', contact);
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Error adding emergency contact: ${response.statusText}`);
    }
}

export async function updateEmergencyContact(contactId: string, contact: Partial<EmergencyContact>): Promise<EmergencyContact> {
    const response = await api.patch(`/user/emergency-contacts/${contactId}`, contact);
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Error updating emergency contact: ${response.statusText}`);
    }
}

export async function deleteEmergencyContact(contactId: string): Promise<void> {
    const response = await api.delete(`/user/emergency-contacts/${contactId}`);
    if (response.status !== 200) {
        throw new Error(`Error deleting emergency contact: ${response.statusText}`);
    }
}

// 紧急报警相关API
export async function triggerEmergencyAlert(alertType: string, metadata?: Record<string, any>): Promise<EmergencyAlert> {
    const response = await api.post('/emergency/trigger', {
        type: alertType,
        metadata
    });
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Error triggering emergency alert: ${response.statusText}`);
    }
}

export async function getEmergencyAlerts(): Promise<EmergencyAlert[]> {
    const response = await api.get('/emergency/alerts');
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Error fetching emergency alerts: ${response.statusText}`);
    }
}

export async function acknowledgeEmergencyAlert(alertId: string): Promise<void> {
    const response = await api.patch(`/emergency/alerts/${alertId}/acknowledge`);
    if (response.status !== 200) {
        throw new Error(`Error acknowledging emergency alert: ${response.statusText}`);
    }
}

export async function testEmergencyNotification(): Promise<void> {
    const response = await api.post('/emergency/test-notification');
    if (response.status !== 200) {
        throw new Error(`Error testing emergency notification: ${response.statusText}`);
    }
}