import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/auth.service';
import '../styles/profile.css';

const Profile = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setProfileError('');
      try {
        const user = await authService.getProfile();
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

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setSaving(true);
    try {
      await authService.updateProfile({ firstName, lastName, email });
      setProfileSuccess('Profile updated successfully.');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="profile-page">
      <header className="profile-header">
        <Link to="/" className="profile-back">
          ← Back to Notes
        </Link>
        <h1 className="profile-title">Profile</h1>
      </header>

      <main className="profile-main">
        {loading ? (
          <p className="profile-loading">Loading profile…</p>
        ) : (
          <>
            <section className="profile-card">
              <h2 className="profile-card-title">Personal Information</h2>

              {profileError && (
                <p className="profile-error" role="alert">
                  {profileError}
                </p>
              )}
              {profileSuccess && (
                <p className="profile-success" role="status">
                  {profileSuccess}
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
            </section>

            <section className="profile-card">
              <h2 className="profile-card-title">Change Password</h2>

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
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Profile;
