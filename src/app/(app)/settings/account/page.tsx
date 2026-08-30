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
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { CheckCircle2, ShieldAlert, KeyRound } from 'lucide-react';

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
      setTimeout(() => setPasswordSuccess(''), 3000);
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
      setDeleteError('Please type DELETE in capital letters to confirm.');
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
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090b] tracking-tight">Account & Security</h1>
        <p className="text-sm text-[#71717a] mt-1">Manage authentication credentials and danger zone settings.</p>
      </div>

      {/* Password Change Card */}
      <Card>
        <CardContent className="p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 pb-2">
            <div className="h-8 w-8 rounded-xl bg-[#09090b] text-[#d4ff00] flex items-center justify-center">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#09090b]">Change Password</h2>
              <p className="text-xs text-[#71717a]">Enter your current password to set a new password.</p>
            </div>
          </div>

          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> {passwordSuccess}
            </div>
          )}

          <div className="space-y-4 max-w-md">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="Min 6 characters"
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
          </div>

          <div className="pt-2">
            <Button variant="primary" size="md" className="font-bold text-xs" onClick={handleChangePassword} loading={passwordSaving}>
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50/30">
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-red-600 text-white flex items-center justify-center">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-red-900">Danger Zone</h2>
              <p className="text-xs text-red-700">Permanently delete account and erase all proposal data.</p>
            </div>
          </div>

          <div className="max-w-md space-y-4 pt-2">
            <Input
              label="Type DELETE to confirm permanent deletion"
              placeholder="DELETE"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />

            {deleteError && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-red-800 text-xs font-medium">
                {deleteError}
              </div>
            )}

            <Button
              variant="primary"
              size="md"
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs disabled:opacity-40"
              loading={deleting}
              disabled={deleteConfirmText !== 'DELETE'}
              onClick={handleDeleteAccount}
            >
              Permanently Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
