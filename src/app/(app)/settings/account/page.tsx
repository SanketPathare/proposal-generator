'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from 'firebase/auth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function AccountSettingsPage() {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const handleChangePassword = async () => {
    if (!user || !user.email) return;
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (!newPassword) {
      setPasswordError('New password is required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Failed to change password:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setPasswordError('Current password is incorrect.');
      } else if (err.code === 'auth/weak-password') {
        setPasswordError('New password is too weak.');
      } else {
        setPasswordError('Failed to update password. Please try again.');
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleteError('');

    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm.');
      return;
    }

    setDeleting(true);
    try {
      await deleteUser(user);
      window.location.href = '/';
    } catch (err: any) {
      console.error('Failed to delete account:', err);
      if (err.code === 'auth/requires-recent-login') {
        setDeleteError('Please sign out and sign back in before deleting your account.');
      } else {
        setDeleteError('Failed to delete account. Please try again.');
      }
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your password and account.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Change Password</CardTitle>
          <CardDescription>Update your account password. You must enter your current password.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-md">
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            {passwordSuccess && <p className="text-sm text-green-600">{passwordSuccess}</p>}

            <Button onClick={handleChangePassword} loading={passwordSaving}>
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
          <CardDescription>Permanently delete your account and all associated data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-md">
            <p className="text-sm text-gray-600">
              This action is irreversible. All your proposals, clients, templates, and settings will be permanently deleted.
            </p>
            <Input
              label="Type DELETE to confirm"
              placeholder="DELETE"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />

            {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}

            <Button
              variant="destructive"
              loading={deleting}
              disabled={deleteConfirmText !== 'DELETE'}
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
