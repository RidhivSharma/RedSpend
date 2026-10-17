import { useState } from "react";
import {
  Button,
  ConfirmDialog,
  DownloadIcon,
  Input,
  LogOutIcon,
  MoonIcon,
  Select,
  SunIcon,
  useToast,
} from "../components/ui";
import { CategoriesSection } from "../components/settings/CategoriesSection";
import { useAuth } from "../context/authContext";
import { useTheme } from "../hooks/useTheme";
import { useTransactions } from "../hooks/useTransactions";
import { deleteDemoTransactions, seedDemoData } from "../services/demoDataService";
import { SUPPORTED_CURRENCIES } from "../utils/constants";
import { exportTransactionsCSV } from "../utils/export";
import { formatCurrency, getInitials } from "../utils/format";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "categories", label: "Categories" },
  { id: "preferences", label: "Preferences" },
];

function ProfileSection() {
  const { user, profile, updateUserProfile, logOut } = useAuth();
  const toast = useToast();
  const displayName =
    profile?.displayName || user?.displayName || user?.email || "User";

  const profileName = profile?.displayName || user?.displayName || "";
  const [name, setName] = useState(profileName);
  const [syncedName, setSyncedName] = useState(profileName);
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (profileName !== syncedName) {
    setSyncedName(profileName);
    setName(profileName);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const trimmed = name.trim();

    if (!trimmed) {
      setNameError("Display name is required.");
      return;
    }
    if (trimmed.length > 60) {
      setNameError("Display name must be 60 characters or fewer.");
      return;
    }

    setNameError("");
    setSaving(true);
    try {
      await updateUserProfile({ displayName: trimmed });
      toast.success("Profile updated.");
    } catch (error) {
      console.error("[SpendWise] Failed to update profile:", error);
      toast.error(
        error?.code
          ? "Could not update your profile. Check your connection and try again."
          : error?.message || "Could not update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logOut();
      toast.success("You have been logged out.");
    } catch {
      toast.error("Could not log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="settings-stack">
      <div className="card">
        <div className="settings-section-head">
          <h2 className="card-title">Profile</h2>
        </div>

        <div className="settings-profile">
          <span className="avatar avatar-lg" aria-hidden="true">
            {getInitials(displayName)}
          </span>
          <div>
            <p className="settings-profile-name">{displayName}</p>
            <p className="settings-profile-email">{user?.email || "No email"}</p>
          </div>
        </div>

        <form className="form-stack settings-form" onSubmit={handleSubmit} noValidate>
          <Input
            label="Display name"
            type="text"
            name="displayName"
            autoComplete="name"
            maxLength={60}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setNameError("");
            }}
            error={nameError}
          />
          <div className="settings-form-actions">
            <Button type="submit" loading={saving}>
              Save changes
            </Button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="settings-section-head">
          <div>
            <h2 className="card-title">Session</h2>
            <p className="card-subtitle">Sign out of SpendWise on this device.</p>
          </div>
        </div>
        <Button variant="secondary" onClick={handleLogout} loading={loggingOut}>
          <LogOutIcon size={18} />
          Log out
        </Button>
      </div>
    </div>
  );
}

function PreferencesSection() {
  const { user, profile, updateUserProfile } = useAuth();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const { data: transactions, loading: transactionsLoading } = useTransactions();
  const [currency, setCurrency] = useState(profile?.currency || "INR");
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [deletingDemo, setDeletingDemo] = useState(false);
  const [confirmingDemoDelete, setConfirmingDemoDelete] = useState(false);

  const profileCurrency = profile?.currency || "INR";
  const [syncedCurrency, setSyncedCurrency] = useState(profileCurrency);

  if (profileCurrency !== syncedCurrency) {
    setSyncedCurrency(profileCurrency);
    setCurrency(profileCurrency);
  }

  const handleCurrencyChange = async (event) => {
    const next = event.target.value;
    const previous = currency;
    if (next === previous) return;

    setCurrency(next);
    setSavingCurrency(true);
    try {
      await updateUserProfile({ currency: next });
      toast.success(`Currency updated to ${next}.`);
    } catch (error) {
      console.error("[SpendWise] Failed to update currency:", error);
      setCurrency(previous);
      toast.error(
        error?.code
          ? "Could not update the currency. Check your connection and try again."
          : error?.message || "Could not update the currency."
      );
    } finally {
      setSavingCurrency(false);
    }
  };

  const handleThemeChange = (nextTheme) => {
    if (theme !== nextTheme) setTheme(nextTheme);
  };

  const handleExportData = () => {
    try {
      exportTransactionsCSV(transactions);
      toast.success(
        `Exported ${transactions.length} ${
          transactions.length === 1 ? "transaction" : "transactions"
        }.`
      );
    } catch (exportError) {
      console.error("[SpendWise] Failed to export data:", exportError);
      toast.error("Could not export your data. Please try again.");
    }
  };

  const demoCount = transactions.filter((transaction) => transaction.isDemo).length;

  const handleAddDemo = async () => {
    if (seedingDemo || deletingDemo) return;
    setSeedingDemo(true);
    try {
      const count = await seedDemoData(user?.uid);
      toast.success(
        `Added ${count} demo ${count === 1 ? "transaction" : "transactions"}.`
      );
    } catch (error) {
      console.error("[SpendWise] Failed to add demo data:", error);
      toast.error(
        error?.code
          ? "Could not add demo data. Check your connection and try again."
          : error?.message || "Could not add demo data."
      );
    } finally {
      setSeedingDemo(false);
    }
  };

  const handleDeleteDemo = async () => {
    if (deletingDemo) return;
    setDeletingDemo(true);
    try {
      const count = await deleteDemoTransactions(user?.uid);
      setConfirmingDemoDelete(false);
      toast.success(
        `Deleted ${count} demo ${count === 1 ? "transaction" : "transactions"}.`
      );
    } catch (error) {
      console.error("[SpendWise] Failed to delete demo data:", error);
      toast.error(
        error?.code
          ? "Could not delete demo data. Check your connection and try again."
          : error?.message || "Could not delete demo data."
      );
    } finally {
      setDeletingDemo(false);
    }
  };

  return (
    <div className="settings-stack">
      <div className="card">
        <div className="settings-section-head">
          <div>
            <h2 className="card-title">Currency</h2>
            <p className="card-subtitle">Used everywhere amounts are shown.</p>
          </div>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-row-title">Display currency</p>
            <p className="settings-row-description">
              Preview: {formatCurrency(1234.5, currency)}
            </p>
          </div>
          <Select
            className="settings-currency-select"
            aria-label="Display currency"
            value={currency}
            onChange={handleCurrencyChange}
            disabled={savingCurrency}
            options={SUPPORTED_CURRENCIES.map((item) => ({
              value: item.code,
              label: item.label,
            }))}
          />
        </div>
      </div>

      <div className="card">
        <div className="settings-section-head">
          <div>
            <h2 className="card-title">Appearance</h2>
            <p className="card-subtitle">Theme choice is saved on this device.</p>
          </div>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-row-title">Theme</p>
            <p className="settings-row-description">
              Switch between light and dark mode.
            </p>
          </div>
          <div className="theme-options" role="group" aria-label="Theme">
            <button
              type="button"
              className={`theme-option${theme === "light" ? " active" : ""}`}
              aria-pressed={theme === "light"}
              onClick={() => handleThemeChange("light")}
            >
              <SunIcon size={16} />
              Light
            </button>
            <button
              type="button"
              className={`theme-option${theme === "dark" ? " active" : ""}`}
              aria-pressed={theme === "dark"}
              onClick={() => handleThemeChange("dark")}
            >
              <MoonIcon size={16} />
              Dark
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="settings-section-head">
          <div>
            <h2 className="card-title">Your data</h2>
            <p className="card-subtitle">
              Download a copy of everything stored in SpendWise.
            </p>
          </div>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-row-title">Export all my data</p>
            <p className="settings-row-description">
              {transactionsLoading
                ? "Checking your transactions…"
                : transactions.length === 0
                  ? "No transactions to export yet."
                  : `Save all ${transactions.length} transactions as a CSV file.`}
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={handleExportData}
            disabled={transactionsLoading || transactions.length === 0}
          >
            <DownloadIcon size={18} />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="card">
        <div className="settings-section-head">
          <div>
            <h2 className="card-title">Demo data</h2>
            <p className="card-subtitle">
              Add three months of realistic sample transactions to explore SpendWise.
            </p>
          </div>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-row-title">Sample transactions</p>
            <p className="settings-row-description">
              {transactionsLoading
                ? "Checking your transactions…"
                : demoCount > 0
                  ? `${demoCount} demo ${
                      demoCount === 1 ? "transaction" : "transactions"
                    } added.`
                  : "No demo data added yet."}
            </p>
          </div>
          <div className="settings-row-actions">
            <Button
              variant="secondary"
              onClick={handleAddDemo}
              loading={seedingDemo}
              disabled={transactionsLoading || deletingDemo}
            >
              Add demo data
            </Button>
            <Button
              variant="danger"
              onClick={() => setConfirmingDemoDelete(true)}
              disabled={
                transactionsLoading || demoCount === 0 || seedingDemo || deletingDemo
              }
            >
              Delete demo data
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmingDemoDelete}
        title="Delete demo data?"
        message="This removes only the sample transactions added by SpendWise. Your own transactions are kept."
        confirmLabel="Delete demo data"
        loading={deletingDemo}
        onConfirm={handleDeleteDemo}
        onCancel={() => {
          if (!deletingDemo) setConfirmingDemoDelete(false);
        }}
      />
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">
            Manage your profile, categories and preferences.
          </p>
        </div>
      </div>

      <div className="settings-tabs" role="tablist" aria-label="Settings sections">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`settings-tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`settings-panel-${item.id}`}
            className={`settings-tab${tab === item.id ? " active" : ""}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`settings-panel-${tab}`}
        aria-labelledby={`settings-tab-${tab}`}
        className="settings-panel"
      >
        {tab === "profile" ? <ProfileSection /> : null}
        {tab === "categories" ? <CategoriesSection /> : null}
        {tab === "preferences" ? <PreferencesSection /> : null}
      </div>
    </section>
  );
}
