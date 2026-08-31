import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import { EditIcon } from '../components/icons';
import '../styles/profile.css';

const getInitials = (firstName, lastName) => `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

const Profile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '' });
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [pendingDeleteAccount, setPendingDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setProfileError('');
      try {
        const user = await authService.getProfile();
        setProfile(user);
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setEmail(user.email);
      } catch (err) {
        setProfileError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleStartEditProfile = () => {
    setProfileError('');
    setProfileSuccess('');
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setEmail(profile.email);
    setProfileError('');
    setIsEditingProfile(false);
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setSaving(true);
    try {
      const user = await authService.updateProfile({ firstName, lastName, email });
      setProfile(user);
      setProfileSuccess('Profile updated successfully.');
      setIsEditingProfile(false);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const resetPasswordForm = () => {
    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleOpenChangePassword = () => {
    setPasswordError('');
    setPasswordSuccess('');
    setIsChangingPassword(true);
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setChangingPassword(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  useEffect(() => {
    if (!isChangingPassword) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        resetPasswordForm();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isChangingPassword]);

  useEffect(() => {
    if (!isEditingProfile) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleCancelEditProfile();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEditingProfile]);

  const handleRequestDeleteAccount = () => {
    setDeleteError('');
    setPendingDeleteAccount(true);
  };

  const handleCancelDeleteAccount = () => {
    setPendingDeleteAccount(false);
  };

  const handleConfirmDeleteAccount = async () => {
    setDeletingAccount(true);
    setDeleteError('');
    try {
      await authService.deleteAccount();
      authService.logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setDeleteError(err.message);
      setDeletingAccount(false);
      setPendingDeleteAccount(false);
    }
  };

  useEffect(() => {
    if (!deleteError) {
      return undefined;
    }

    const timeoutId = setTimeout(() => setDeleteError(''), 5000);
    return () => clearTimeout(timeoutId);
  }, [deleteError]);

  useEffect(() => {
    if (!pendingDeleteAccount) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleCancelDeleteAccount();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [pendingDeleteAccount]);

  return (
    <div className="profile-page">
      <header className="profile-header">
        <Link to="/" className="profile-back" aria-label="Back to Notes">
          ←
        </Link>
        <h1 className="profile-title">Profile</h1>
      </header>

      <main className="profile-main">
        {loading ? (
          <p className="profile-loading">Loading profile…</p>
        ) : (
          <div className="profile-forms">
            <section className="profile-card">
              <div className="profile-card-header">
                <div className="profile-identity">
                  <div className="profile-avatar" aria-hidden="true">
                    {getInitials(profile.firstName, profile.lastName) || '?'}
                  </div>
                  <div>
                    <h2 className="profile-card-title">Personal Information</h2>
                    <p className="profile-card-subtitle">Update your name and email address.</p>
                  </div>
                </div>
                {!isEditingProfile && (
                  <button
                    type="button"
                    className="profile-icon-button"
                    onClick={handleStartEditProfile}
                    aria-label="Edit personal information"
                  >
                    <EditIcon size={16} />
                  </button>
                )}
              </div>

              {profileError && !isEditingProfile && (
                <p className="profile-error" role="alert">
                  {profileError}
                </p>
              )}
              {profileSuccess && (
                <p className="profile-success" role="status">
                  {profileSuccess}
                </p>
              )}

              <dl className="profile-view">
                <div className="profile-view-row">
                  <dt className="profile-view-label">First Name</dt>
                  <dd className="profile-view-value">{profile.firstName}</dd>
                </div>
                <div className="profile-view-row">
                  <dt className="profile-view-label">Last Name</dt>
                  <dd className="profile-view-value">{profile.lastName}</dd>
                </div>
                <div className="profile-view-row">
                  <dt className="profile-view-label">Email Address</dt>
                  <dd className="profile-view-value">{profile.email}</dd>
                </div>
              </dl>
            </section>

            <section className="profile-card">
              <div className="profile-card-header">
                <div>
                  <h2 className="profile-card-title">Change Password</h2>
                  <p className="profile-card-subtitle">Choose a new password for your account.</p>
                </div>
                <button type="button" className="profile-secondary-button" onClick={handleOpenChangePassword}>
                  Change Password
                </button>
              </div>
            </section>

            <section className="profile-card profile-card-danger">
              <div className="profile-card-header">
                <div>
                  <h2 className="profile-card-title">Delete Account</h2>
                  <p className="profile-card-subtitle">Permanently delete your account and all of your notes.</p>
                </div>
                <button type="button" className="profile-delete-button" onClick={handleRequestDeleteAccount}>
                  Delete Account
                </button>
              </div>

              {deleteError && (
                <p className="profile-error" role="alert">
                  {deleteError}
                </p>
              )}
            </section>
          </div>
        )}
      </main>

      {isEditingProfile && (
        <div className="profile-form-overlay" role="presentation" onClick={handleCancelEditProfile}>
          <div
            className="profile-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="profile-form-modal-header">
              <h2 id="edit-profile-title" className="profile-form-modal-title">
                Edit Personal Information
              </h2>
              <button
                type="button"
                className="profile-form-modal-close"
                onClick={handleCancelEditProfile}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {profileError && (
              <p className="profile-error" role="alert">
                {profileError}
              </p>
            )}

            <form className="profile-form" onSubmit={handleProfileSubmit}>
              <div className="profile-field-group">
                <div className="profile-field">
                  <label className="profile-label" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className="profile-input"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                  />
                </div>

                <div className="profile-field">
                  <label className="profile-label" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className="profile-input"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="profile-field">
                <label className="profile-label" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="profile-input"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <button type="submit" className="profile-submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isChangingPassword && (
        <div className="profile-form-overlay" role="presentation" onClick={resetPasswordForm}>
          <div
            className="profile-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-password-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="profile-form-modal-header">
              <h2 id="change-password-title" className="profile-form-modal-title">
                Change Password
              </h2>
              <button type="button" className="profile-form-modal-close" onClick={resetPasswordForm} aria-label="Close">
                ✕
              </button>
            </div>

            {passwordError && (
              <p className="profile-error" role="alert">
                {passwordError}
              </p>
            )}
            {passwordSuccess && (
              <p className="profile-success" role="status">
                {passwordSuccess}
              </p>
            )}

            <form className="profile-form" onSubmit={handlePasswordSubmit}>
              <div className="profile-field">
                <label className="profile-label" htmlFor="currentPassword">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  className="profile-input"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="profile-field">
                <label className="profile-label" htmlFor="newPassword">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  className="profile-input"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>

              <button type="submit" className="profile-submit" disabled={changingPassword}>
                {changingPassword ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {pendingDeleteAccount && (
        <div className="profile-confirm-overlay">
          <button
            type="button"
            className="profile-confirm-backdrop"
            aria-label="Cancel delete"
            onClick={handleCancelDeleteAccount}
          />
          <div
            className="profile-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-account-title"
          >
            <p id="confirm-delete-account-title" className="profile-confirm-title">
              Delete your account?
            </p>
            <p className="profile-confirm-text">
              This will permanently delete your account and all of your notes. This action cannot be undone.
            </p>
            <div className="profile-confirm-actions">
              <button
                type="button"
                className="profile-confirm-cancel"
                onClick={handleCancelDeleteAccount}
                disabled={deletingAccount}
              >
                Cancel
              </button>
              <button
                type="button"
                className="profile-confirm-delete"
                onClick={handleConfirmDeleteAccount}
                disabled={deletingAccount}
              >
                {deletingAccount ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
