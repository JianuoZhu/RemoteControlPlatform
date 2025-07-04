export enum WarningLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum WarningType {
  BATTERY_LOW = 'battery_low',
  BATTERY_CRITICAL = 'battery_critical',
  JOINT_FAILURE = 'joint_failure',
  ROBOT_OFFLINE = 'robot_offline',
  SYSTEM_ERROR = 'system_error',
  TASK_FAILURE = 'task_failure',
  EMERGENCY_FALL = 'emergency_fall',
  EMERGENCY_HEART_RATE = 'emergency_heart_rate',
  EMERGENCY_OTHER = 'emergency_other'
}

export interface Warning {
  id: string;
  type: WarningType;
  level: WarningLevel;
  title: string;
  message: string;
  timestamp: string;
  isResolved: boolean;
  resolvedAt?: string;
  metadata?: Record<string, any>;
}

export interface WarningSettings {
  emailNotifications: boolean;
  emailRecipients: string[];
  messageNotifications: boolean;
  autoResolve: boolean;
  warningThresholds: {
    batteryLow: number;
    batteryCritical: number;
    jointHealthCheckInterval: number;
    robotOfflineTimeout: number;
  };
}

export interface NotificationPayload {
  type: WarningType;
  level: WarningLevel;
  title: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// 用户配置相关类型
export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  emergencyContacts: EmergencyContact[];
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  isPrimary: boolean;
}

export interface EmergencyAlert {
  id: string;
  type: WarningType;
  level: WarningLevel;
  title: string;
  message: string;
  timestamp: string;
  location?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isAcknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  metadata?: Record<string, any>;
} 