import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ExternalLink,
  Headphones,
  ImagePlus,
  Laptop,
  LogOut,
  Monitor,
  MoreVertical,
  Pencil,
  Smartphone,
  Trash2,
} from "lucide-react";
import AccountSidebar from "../components/account/AccountSidebar";
import AppShell from "../components/layout/AppShell";
import Footer from "../components/layout/Footer";
import {
  useActiveDevices,
  useCurrentUser,
  useDeleteProfileImage,
  useLogoutDevice,
  useLogoutOtherDevices,
  useUpdateUsername,
  useUploadProfileImage,
} from "../hooks/useAuth";
import { mapDeviceSession } from "../utils/deviceMappers";

const DEFAULT_PROFILE_URL =
  "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const PROFILE_IMAGE_TYPES = new Set([
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_ACTIVE_DEVICES = 2;

const deviceIcons = {
  laptop: Laptop,
  phone: Smartphone,
  tv: Monitor,
};

function Profile() {
  const location = useLocation();
  const [editingField, setEditingField] = useState(null);
  const [notice, setNotice] = useState(null);
  const noticeTimerRef = useRef(null);
  const currentUserQuery = useCurrentUser();
  const updateUsernameMutation = useUpdateUsername();
  const uploadProfileImageMutation = useUploadProfileImage();
  const deleteProfileImageMutation = useDeleteProfileImage();
  const user = currentUserQuery.data;

  useEffect(() => {
    if (location.hash !== "#active-devices") return undefined;

    const frame = window.requestAnimationFrame(() => {
      document.getElementById("active-devices")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.hash]);

  useEffect(
    () => () => {
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current);
      }
    },
    [],
  );

  const showNotice = (message, variant = "success") => {
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }

    setNotice({ message, variant });
    noticeTimerRef.current = window.setTimeout(() => {
      setNotice(null);
      noticeTimerRef.current = null;
    }, 3500);
  };

  const handleSaveUsername = async (username) => {
    await updateUsernameMutation.mutateAsync(username);
    setEditingField(null);
    showNotice("Username updated successfully");
  };

  const handleUploadProfileImage = async (file) => {
    if (!PROFILE_IMAGE_TYPES.has(file?.type)) {
      showNotice("Choose a JPG, PNG, WebP, or AVIF image.", "error");
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      showNotice("Profile images must be 5 MB or smaller.", "error");
      return;
    }

    try {
      await uploadProfileImageMutation.mutateAsync(file);
      showNotice("Profile picture updated successfully");
    } catch (error) {
      showNotice(error?.message || "Profile picture upload failed.", "error");
    }
  };

  const handleDeleteProfileImage = async () => {
    try {
      await deleteProfileImageMutation.mutateAsync();
      showNotice("Profile picture removed");
    } catch (error) {
      showNotice(error?.message || "Profile picture could not be removed.", "error");
    }
  };

  return (
    <AppShell>
      <main className="profile-page">
        <AccountSidebar
          activeId={location.hash === "#active-devices" ? "devices" : "profile"}
          ariaLabel="Profile settings"
        />

        <section className="profile-content" aria-labelledby="profile-title">
          {notice ? (
            <div
              aria-live="polite"
              className={`profile-toast profile-toast--${notice.variant}`}
              role={notice.variant === "error" ? "alert" : "status"}
            >
              {notice.variant === "error" ? (
                <AlertCircle aria-hidden="true" size={20} strokeWidth={2} />
              ) : (
                <CheckCircle2 aria-hidden="true" size={20} strokeWidth={2} />
              )}
              <span>{notice.message}</span>
            </div>
          ) : null}

          <header className="profile-heading">
            <h1 id="profile-title">My Profile</h1>
            <p>Manage your profile information and preferences.</p>
          </header>

          <div className="profile-layout">
            <div className="profile-main">
              <ProfileInformation
                isDeleting={deleteProfileImageMutation.isPending}
                isUploading={uploadProfileImageMutation.isPending}
                onDeleteProfileImage={handleDeleteProfileImage}
                onEditField={setEditingField}
                onUploadProfileImage={handleUploadProfileImage}
                user={user}
              />
              <ActiveDevices onNotice={showNotice} />
            </div>

            <NeedHelpCard />
          </div>
        </section>
      </main>
      {editingField ? (
        <EditProfileFieldModal
          field={editingField}
          onClose={() => setEditingField(null)}
          onSave={handleSaveUsername}
        />
      ) : null}
      <Footer />
    </AppShell>
  );
}

function ProfileInformation({
  isDeleting,
  isUploading,
  onDeleteProfileImage,
  onEditField,
  onUploadProfileImage,
  user,
}) {
  const avatarMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const username = user?.username || user?.name || "User";
  const avatar = user?.profileURL || user?.avatar || DEFAULT_PROFILE_URL;
  const canRemoveAvatar = Boolean(
    user?.profileURL && user.profileURL !== DEFAULT_PROFILE_URL,
  );
  const fields = [
    {
      id: "username",
      label: "Username",
      type: "text",
      value: username,
      editable: true,
    },
    {
      id: "email",
      label: "Email Address",
      type: "email",
      value: user?.email || "",
      editable: false,
    },
    {
      id: "preferredLanguage",
      label: "Preferred Language",
      value: "English",
      editable: false,
    },
  ];

  useEffect(() => {
    if (!isAvatarMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!avatarMenuRef.current?.contains(event.target)) {
        setIsAvatarMenuOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setIsAvatarMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isAvatarMenuOpen]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setIsAvatarMenuOpen(false);
    if (file) onUploadProfileImage(file);
  };

  return (
    <section
      className="profile-panel profile-info-card"
      aria-labelledby="profile-info-title"
    >
      <h2 id="profile-info-title">Profile Information</h2>

      <div className="profile-info-card__body">
        <div className="profile-avatar-editor" ref={avatarMenuRef}>
          <img src={avatar} alt={`${username} profile`} />
          <input
            accept="image/avif,image/jpeg,image/png,image/webp"
            aria-label="Upload profile photo"
            className="sr-only"
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
          <button
            aria-expanded={isAvatarMenuOpen}
            aria-haspopup="menu"
            disabled={isDeleting || isUploading}
            onClick={() => setIsAvatarMenuOpen((isOpen) => !isOpen)}
            type="button"
            aria-label="Change profile photo"
          >
            <Camera aria-hidden="true" size={18} strokeWidth={1.9} />
          </button>
          {isAvatarMenuOpen ? (
            <div className="profile-avatar-menu" role="menu">
              <button
                onClick={() => fileInputRef.current?.click()}
                role="menuitem"
                type="button"
              >
                <ImagePlus aria-hidden="true" size={17} strokeWidth={1.9} />
                Upload photo
              </button>
              {canRemoveAvatar ? (
                <button
                  className="profile-avatar-menu__remove"
                  onClick={() => {
                    setIsAvatarMenuOpen(false);
                    onDeleteProfileImage();
                  }}
                  role="menuitem"
                  type="button"
                >
                  <Trash2 aria-hidden="true" size={17} strokeWidth={1.9} />
                  Remove photo
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="profile-fields">
          {fields.map((field) => (
            <div className="profile-field" key={field.label}>
              <span>
                <small>{field.label}</small>
                <strong>{field.value}</strong>
              </span>
              {field.editable ? (
                <button
                  type="button"
                  aria-label={`Edit ${field.label}`}
                  onClick={() => onEditField(field)}
                >
                  <Pencil aria-hidden="true" size={18} strokeWidth={1.8} />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ActiveDevices({ onNotice }) {
  const [isLogoutOthersConfirmOpen, setIsLogoutOthersConfirmOpen] =
    useState(false);
  const devicesQuery = useActiveDevices();
  const logoutDeviceMutation = useLogoutDevice();
  const logoutOtherDevicesMutation = useLogoutOtherDevices();
  const devices = (devicesQuery.data || []).map((device) =>
    mapDeviceSession(device),
  );
  const otherDeviceCount = devices.filter((device) => !device.isCurrent).length;

  const handleLogoutDevice = async (device) => {
    try {
      await logoutDeviceMutation.mutateAsync(device.id);
      onNotice(`${device.name} signed out`);
    } catch (error) {
      onNotice(error?.message || "Device could not be signed out.", "error");
    }
  };

  const handleLogoutOtherDevices = async () => {
    try {
      const response = await logoutOtherDevicesMutation.mutateAsync();
      setIsLogoutOthersConfirmOpen(false);
      const count = Number(response?.revokedCount) || otherDeviceCount;
      onNotice(
        count === 1 ? "Other device signed out" : "Other devices signed out",
      );
    } catch (error) {
      onNotice(
        error?.message || "Other devices could not be signed out.",
        "error",
      );
    }
  };

  return (
    <section
      className="profile-panel active-devices"
      aria-labelledby="active-devices-title"
      id="active-devices"
    >
      <header className="active-devices__header">
        <span className="profile-panel-icon">
          <Monitor aria-hidden="true" size={27} strokeWidth={1.8} />
        </span>
        <span>
          <h2 id="active-devices-title">
            Active Devices ({devices.length}/{MAX_ACTIVE_DEVICES})
          </h2>
          <p>Manage devices that are signed in to your account.</p>
        </span>
        <button
          disabled={!otherDeviceCount || devicesQuery.isLoading}
          onClick={() => setIsLogoutOthersConfirmOpen(true)}
          type="button"
        >
          Sign out other devices
        </button>
      </header>

      <div className="active-device-list">
        {devicesQuery.isLoading ? (
          <DeviceState message="Loading active devices..." />
        ) : devicesQuery.isError ? (
          <DeviceState
            actionLabel="Try again"
            message="Active devices could not be loaded."
            onAction={() => devicesQuery.refetch()}
          />
        ) : devices.length ? (
          devices.map((device) => (
            <DeviceRow
              device={device}
              isLoggingOut={
                logoutDeviceMutation.isPending &&
                String(logoutDeviceMutation.variables) === device.id
              }
              key={device.id}
              onLogout={handleLogoutDevice}
            />
          ))
        ) : (
          <DeviceState message="No active devices were found." />
        )}
      </div>

      {isLogoutOthersConfirmOpen ? (
        <DeviceLogoutConfirm
          count={otherDeviceCount}
          isPending={logoutOtherDevicesMutation.isPending}
          onCancel={() => setIsLogoutOthersConfirmOpen(false)}
          onConfirm={handleLogoutOtherDevices}
        />
      ) : null}
    </section>
  );
}

function DeviceRow({ device, isLoggingOut, onLogout }) {
  const Icon = deviceIcons[device.type] || Monitor;
  const menuRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  return (
    <article className="active-device-row">
      <Icon aria-hidden="true" size={28} strokeWidth={1.65} />
      <div className="active-device-row__details">
        <strong>
          {device.name}
          {device.isCurrent ? <em>This Device</em> : null}
        </strong>
        <small>
          {device.location}
          <span aria-hidden="true">•</span>
          {device.platform}
        </small>
      </div>
      <div className="active-device-row__status">
        <span>{device.status}</span>
        {!device.isCurrent ? (
          <div className="device-menu" ref={menuRef}>
            <button
              type="button"
              aria-label={`Manage ${device.name}`}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
            >
              <MoreVertical aria-hidden="true" size={19} strokeWidth={1.9} />
            </button>

            {isMenuOpen ? (
              <div className="device-menu__popover" role="menu">
                <button
                  disabled={isLoggingOut}
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogout(device);
                  }}
                  type="button"
                  role="menuitem"
                >
                  <LogOut aria-hidden="true" size={17} strokeWidth={1.9} />
                  <span>{isLoggingOut ? "Signing Out..." : "Logout Device"}</span>
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function DeviceState({ actionLabel, message, onAction }) {
  return (
    <div className="active-devices__state">
      <span>{message}</span>
      {onAction ? (
        <button onClick={onAction} type="button">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function DeviceLogoutConfirm({ count, isPending, onCancel, onConfirm }) {
  return (
    <div className="profile-modal" onMouseDown={onCancel} role="presentation">
      <section
        aria-labelledby="device-logout-confirm-title"
        aria-modal="true"
        className="profile-modal__card"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="profile-modal__heading">
          <h2 id="device-logout-confirm-title">Sign out other devices?</h2>
          <p>
            {count === 1
              ? "The other device will need a new verification code to sign in again."
              : `All ${count} other devices will need a new verification code to sign in again.`}
          </p>
        </div>
        <div className="profile-modal__actions">
          <button disabled={isPending} onClick={onCancel} type="button">
            Cancel
          </button>
          <button
            className="profile-modal__primary"
            disabled={isPending}
            onClick={onConfirm}
            type="button"
          >
            {isPending ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </section>
    </div>
  );
}

function NeedHelpCard() {
  return (
    <aside className="profile-help-card" aria-labelledby="profile-help-title">
      <span className="profile-help-card__icon">
        <Headphones aria-hidden="true" size={31} strokeWidth={1.9} />
      </span>
      <div>
        <h2 id="profile-help-title">Need Help?</h2>
        <p>Visit our Help Center for answers to common questions.</p>
      </div>
      <Link to="/support">
        Go to Help Center
        <ExternalLink aria-hidden="true" size={15} strokeWidth={1.9} />
      </Link>
    </aside>
  );
}

function EditProfileFieldModal({ field, onClose, onSave }) {
  const [value, setValue] = useState(field.value);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const username = value.trim();

    if (username.length < 2 || username.length > 50) {
      setError("Username must be between 2 and 50 characters.");
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      await onSave(username);
    } catch (saveError) {
      setError(saveError?.message || "Username could not be updated.");
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-modal" role="presentation" onMouseDown={onClose}>
      <form
        className="profile-modal__card"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="profile-modal__heading">
          <h2>Edit {field.label}</h2>
          <p>This name appears across your AfricanMovies account.</p>
        </div>

        <label className="profile-modal__field">
          <span>{field.label}</span>
          <input
            ref={inputRef}
            type={field.type || "text"}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </label>

        {error ? <p className="profile-modal__error">{error}</p> : null}

        <div className="profile-modal__actions">
          <button disabled={isSaving} type="button" onClick={onClose}>
            Cancel
          </button>
          <button disabled={isSaving} type="submit">
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;
