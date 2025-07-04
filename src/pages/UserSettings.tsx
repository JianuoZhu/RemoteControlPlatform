import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  TextInput, 
  Label, 
  Checkbox, 
  Badge, 
  Modal,
  Select
} from 'flowbite-react';
import { HiUser, HiPhone, HiMail, HiPlus, HiPencil, HiTrash, HiExclamation } from 'react-icons/hi';
import { 
  getUserProfile, 
  updateUserProfile, 
  addEmergencyContact, 
  updateEmergencyContact, 
  deleteEmergencyContact,
  testEmergencyNotification
} from '../api';
import { UserProfile, EmergencyContact } from '../types/warning';

export default function UserSettings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
    isPrimary: false
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const data = await getUserProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // 创建默认配置
      setProfile({
        id: '1',
        name: '',
        phone: '',
        email: '',
        emergencyContacts: [],
        notificationPreferences: {
          email: true,
          sms: true,
          push: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const updatedProfile = await updateUserProfile(profile);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleContactSave = async () => {
    try {
      if (editingContact) {
        await updateEmergencyContact(editingContact.id, contactForm);
      } else {
        await addEmergencyContact(contactForm);
      }
      await loadUserProfile();
      setShowContactModal(false);
      setEditingContact(null);
      setContactForm({
        name: '',
        phone: '',
        email: '',
        relationship: '',
        isPrimary: false
      });
    } catch (error) {
      console.error('Failed to save contact:', error);
    }
  };

  const handleContactEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setContactForm({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      relationship: contact.relationship,
      isPrimary: contact.isPrimary
    });
    setShowContactModal(true);
  };

  const handleContactDelete = async (contactId: string) => {
    if (window.confirm('确定要删除这个紧急联系人吗？')) {
      try {
        await deleteEmergencyContact(contactId);
        await loadUserProfile();
      } catch (error) {
        console.error('Failed to delete contact:', error);
      }
    }
  };

  const handleTestNotification = async () => {
    try {
      await testEmergencyNotification();
      alert('测试通知已发送！');
    } catch (error) {
      console.error('Failed to send test notification:', error);
      alert('发送测试通知失败');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">用户配置</h1>
        <Button 
          color="warning" 
          onClick={handleTestNotification}
          className="flex items-center gap-2"
        >
          <HiExclamation className="h-4 w-4" />
          测试紧急通知
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 个人信息 */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HiUser className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-medium">个人信息</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">姓名</Label>
              <TextInput
                id="name"
                value={profile?.name || ''}
                onChange={(e) => setProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                placeholder="请输入您的姓名"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">手机号码</Label>
              <TextInput
                id="phone"
                value={profile?.phone || ''}
                onChange={(e) => setProfile(prev => prev ? {...prev, phone: e.target.value} : null)}
                placeholder="请输入手机号码"
              />
            </div>
            
            <div>
              <Label htmlFor="email">邮箱地址</Label>
              <TextInput
                id="email"
                type="email"
                value={profile?.email || ''}
                onChange={(e) => setProfile(prev => prev ? {...prev, email: e.target.value} : null)}
                placeholder="请输入邮箱地址"
              />
            </div>
            
            <Button 
              color="blue" 
              onClick={handleProfileSave}
              disabled={saving}
              className="w-full"
            >
              {saving ? '保存中...' : '保存个人信息'}
            </Button>
          </div>
        </Card>

        {/* 通知偏好 */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HiMail className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-medium">通知偏好</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="email-notification"
                checked={profile?.notificationPreferences.email || false}
                onChange={(e) => setProfile(prev => prev ? {
                  ...prev, 
                  notificationPreferences: {
                    ...prev.notificationPreferences,
                    email: e.target.checked
                  }
                } : null)}
              />
              <Label htmlFor="email-notification">邮件通知</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="sms-notification"
                checked={profile?.notificationPreferences.sms || false}
                onChange={(e) => setProfile(prev => prev ? {
                  ...prev, 
                  notificationPreferences: {
                    ...prev.notificationPreferences,
                    sms: e.target.checked
                  }
                } : null)}
              />
              <Label htmlFor="sms-notification">短信通知</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="push-notification"
                checked={profile?.notificationPreferences.push || false}
                onChange={(e) => setProfile(prev => prev ? {
                  ...prev, 
                  notificationPreferences: {
                    ...prev.notificationPreferences,
                    push: e.target.checked
                  }
                } : null)}
              />
              <Label htmlFor="push-notification">推送通知</Label>
            </div>
          </div>
        </Card>
      </div>

      {/* 紧急联系人 */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HiPhone className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-medium">紧急联系人</h2>
          </div>
          <Button 
            color="blue" 
            size="sm"
            onClick={() => setShowContactModal(true)}
            className="flex items-center gap-2"
          >
            <HiPlus className="h-4 w-4" />
            添加联系人
          </Button>
        </div>
        
        <div className="space-y-3">
          {profile?.emergencyContacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无紧急联系人，请添加至少一个联系人
            </div>
          ) : (
            profile?.emergencyContacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{contact.name}</span>
                    {contact.isPrimary && (
                      <Badge color="red">主要联系人</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <div>{contact.phone}</div>
                    <div>{contact.email}</div>
                    <div>关系: {contact.relationship}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    color="gray" 
                    size="sm"
                    onClick={() => handleContactEdit(contact)}
                  >
                    <HiPencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    color="failure" 
                    size="sm"
                    onClick={() => handleContactDelete(contact.id)}
                  >
                    <HiTrash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* 联系人编辑模态框 */}
      <Modal show={showContactModal} onClose={() => {
        setShowContactModal(false);
        setEditingContact(null);
        setContactForm({
          name: '',
          phone: '',
          email: '',
          relationship: '',
          isPrimary: false
        });
      }}>
        <div className="relative w-full h-full max-w-md md:h-auto">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingContact ? '编辑紧急联系人' : '添加紧急联系人'}
              </h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={() => {
                  setShowContactModal(false);
                  setEditingContact(null);
                  setContactForm({
                    name: '',
                    phone: '',
                    email: '',
                    relationship: '',
                    isPrimary: false
                  });
                }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label htmlFor="contact-name">姓名</Label>
                <TextInput
                  id="contact-name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({...prev, name: e.target.value}))}
                  placeholder="请输入联系人姓名"
                />
              </div>
              
              <div>
                <Label htmlFor="contact-phone">手机号码</Label>
                <TextInput
                  id="contact-phone"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm(prev => ({...prev, phone: e.target.value}))}
                  placeholder="请输入手机号码"
                />
              </div>
              
              <div>
                <Label htmlFor="contact-email">邮箱地址</Label>
                <TextInput
                  id="contact-email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({...prev, email: e.target.value}))}
                  placeholder="请输入邮箱地址"
                />
              </div>
              
              <div>
                <Label htmlFor="contact-relationship">关系</Label>
                <Select
                  id="contact-relationship"
                  value={contactForm.relationship}
                  onChange={(e) => setContactForm(prev => ({...prev, relationship: e.target.value}))}
                >
                  <option value="">请选择关系</option>
                  <option value="配偶">配偶</option>
                  <option value="子女">子女</option>
                  <option value="父母">父母</option>
                  <option value="朋友">朋友</option>
                  <option value="邻居">邻居</option>
                  <option value="其他">其他</option>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="contact-primary"
                  checked={contactForm.isPrimary}
                  onChange={(e) => setContactForm(prev => ({...prev, isPrimary: e.target.checked}))}
                />
                <Label htmlFor="contact-primary">设为主要联系人</Label>
              </div>
            </div>
            <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
              <Button onClick={handleContactSave}>
                {editingContact ? '更新' : '添加'}
              </Button>
              <Button color="gray" onClick={() => {
                setShowContactModal(false);
                setEditingContact(null);
                setContactForm({
                  name: '',
                  phone: '',
                  email: '',
                  relationship: '',
                  isPrimary: false
                });
              }}>
                取消
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
} 