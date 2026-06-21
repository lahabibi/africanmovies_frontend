import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  ChevronDown,
  ExternalLink,
  Headphones,
  Laptop,
  LogOut,
  Monitor,
  MoreVertical,
  Pencil,
  Smartphone,
} from "lucide-react";
import AccountSidebar from "../components/account/AccountSidebar";
import AppShell from "../components/layout/AppShell";
import { currentUser } from "../data/sessionData";
import { activeDevices, profileInfo } from "../data/profileData";
import Footer from "../components/layout/Footer";

const deviceIcons = {
  laptop: Laptop,
  phone: Smartphone,
  tv: Monitor,
};

function Profile() {
  const [editingField, setEditingField] = useState(null);

  return (
    <AppShell>
      <main className="profile-page">
        <AccountSidebar activeId="profile" ariaLabel="Profile settings" />

        <section className="profile-content" aria-labelledby="profile-title">
          <header className="profile-heading">
            <h1 id="profile-title">My Profile</h1>
            <p>Manage your profile information and preferences.</p>
          </header>

          <div className="profile-layout">
            <div className="profile-main">
              <ProfileInformation onEditField={setEditingField} />
              <ActiveDevices />
            </div>

            <NeedHelpCard />
          </div>
        </section>
      </main>
      {editingField ? (
        <EditProfileFieldModal
          field={editingField}
          onClose={() => setEditingField(null)}
        />
      ) : null}
      <Footer />
    </AppShell>
  );
}

function ProfileInformation({ onEditField }) {
  const fields = [
    {
      id: "fullName",
      label: "Full Name",
      type: "text",
      value: profileInfo.fullName,
      editable: true,
    },
    {
      id: "email",
      label: "Email Address",
      type: "email",
      value: profileInfo.email,
      editable: true,
    },
    {
      id: "phoneNumber",
      label: "Phone Number",
      type: "tel",
      value: profileInfo.phoneNumber,
      editable: true,
    },
    {
      id: "preferredLanguage",
      label: "Preferred Language",
      value: profileInfo.preferredLanguage,
      editable: false,
      dropdown: true,
    },
  ];

  return (
    <section
      className="profile-panel profile-info-card"
      aria-labelledby="profile-info-title"
    >
      <h2 id="profile-info-title">Profile Information</h2>

      <div className="profile-info-card__body">
        <div className="profile-avatar-editor">
          <img src={currentUser.avatar} alt="" aria-hidden="true" />
          <button type="button" aria-label="Change profile photo">
            <Camera aria-hidden="true" size={18} strokeWidth={1.9} />
          </button>
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
              {field.dropdown ? (
                <button type="button" aria-label="Change preferred language">
                  <ChevronDown aria-hidden="true" size={19} strokeWidth={1.8} />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ActiveDevices() {
  return (
    <section
      className="profile-panel active-devices"
      aria-labelledby="active-devices-title"
    >
      <header className="active-devices__header">
        <span className="profile-panel-icon">
          <Monitor aria-hidden="true" size={27} strokeWidth={1.8} />
        </span>
        <span>
          <h2 id="active-devices-title">Active Devices</h2>
          <p>Manage devices that are signed in to your account.</p>
        </span>
        <button type="button">Sign out of all devices</button>
      </header>

      <div className="active-device-list">
        {activeDevices.map((device) => (
          <DeviceRow device={device} key={device.id} />
        ))}
      </div>
    </section>
  );
}

function DeviceRow({ device }) {
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
                <button type="button" role="menuitem">
                  <LogOut aria-hidden="true" size={17} strokeWidth={1.9} />
                  <span>Logout Device</span>
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
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

function EditProfileFieldModal({ field, onClose }) {
  const [value, setValue] = useState(field.value);
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

  const handleSubmit = (event) => {
    event.preventDefault();
    onClose();
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
          <p>Update this detail now. We will connect saving to the API later.</p>
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

        <div className="profile-modal__actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit">Save Changes</button>
        </div>
      </form>
    </div>
  );
}

export default Profile;
