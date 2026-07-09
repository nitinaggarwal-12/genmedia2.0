import React, { createContext, useContext, useState, useEffect } from "react";

// =====================================================================
// INTERFACES & TYPES
// =====================================================================

export interface Campaign {
  id: string;
  name: string;
  brand: string;
  therapeuticArea: string;
  pdfName: string | null;
  metrics: {
    hazard_ratio?: string;
    rfs_rate?: string;
    p_value?: string;
  };
  copyText: string;
  complianceScore: number;
  regulatoryReasoning: string;
  activeViolations: { word: string; rule: string; count: number }[];
  assets: { name: string; size: string; resolution: string; url: string; status: "Compliant" | "Violating"; type: "image" | "video" }[];
  status: "Creative" | "Medical" | "Legal Review" | "Final Signoff" | "Deployment" | "Completed";
  step: number;
  budget: number;
  updatedAt: number;
  createdAt: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "warning" | "info";
  timestamp: number;
  read: boolean;
}

export interface ClinicalTrial {
  id: string;
  name: string;
  pdfName: string;
  metrics: {
    hazard_ratio: string;
    rfs_rate: string;
    p_value: string;
  };
  claims: string[];
  ingestedAt: number;
}

export interface AudienceCohort {
  id: string;
  name: string;
  size: number;
  region: string;
  engagement: number;
  status: "Active" | "Draft";
}

export interface TeamMember {
  id: string;
  name: string;
  role: "Regulatory" | "Medical" | "Legal" | "Brand Manager";
  status: "Active" | "Away";
  avatar: string;
}

export interface SystemSettings {
  gatewayMode: "live" | "simulation";
  maintenanceMode: boolean;
  auditLogging: boolean;
  auditLogs: { timestamp: number; level: "INFO" | "WARN" | "SUCCESS"; message: string }[];
}

interface CampaignContextType {
  // Campaigns
  campaigns: Campaign[];
  activeCampaignId: string | null;
  activeCampaign: Campaign | null;
  addCampaign: (campaign: Omit<Campaign, "id" | "createdAt" | "updatedAt">) => string;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  selectCampaign: (id: string | null) => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (title: string, message: string, type?: "success" | "warning" | "info") => void;
  clearNotifications: () => void;
  markNotificationsAsRead: () => void;

  // Clinical Trials (RAG)
  clinicalTrials: ClinicalTrial[];
  ingestTrial: (trial: Omit<ClinicalTrial, "id" | "ingestedAt">) => void;

  // Audience Cohorts
  audienceCohorts: AudienceCohort[];
  addCohort: (cohort: Omit<AudienceCohort, "id">) => void;
  updateCohort: (id: string, updates: Partial<AudienceCohort>) => void;
  deleteCohort: (id: string) => void;

  // Team Governance
  teamMembers: TeamMember[];
  addTeamMember: (member: Omit<TeamMember, "id" | "avatar">) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;

  // System Settings & Logs
  settings: SystemSettings;
  updateSettings: (updates: Partial<Omit<SystemSettings, "auditLogs">>) => void;
  addAuditLog: (message: string, level?: "INFO" | "WARN" | "SUCCESS") => void;
  clearAuditLogs: () => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

// =====================================================================
// SEED MOCK DATA
// =====================================================================

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-1",
    name: "Zygardia Q3 Launch Campaign",
    brand: "product_a",
    therapeuticArea: "Oncology (Renal Cell Carcinoma)",
    pdfName: "Zygardia_Post_Nephrectomy_Study.pdf",
    metrics: {
      hazard_ratio: "0.58",
      rfs_rate: "78.4%",
      p_value: "<0.001"
    },
    copyText: "ZYGARDIA 10mg is guaranteed to offer a miracle cure with sustained trial results.",
    complianceScore: 78,
    regulatoryReasoning: "The promotional copy contains high-risk absolute efficacy claims ('guaranteed') and speculative superlatives ('miracle cure') that violate FDA Rule 21 CFR 312.7 and Merck Brand Guidelines. Efficacy claims must be supported by double-blind clinical data and avoid absolute guarantees.",
    activeViolations: [
      {
        word: "miracle cure",
        rule: "FDA Rule 21 CFR 312.7: Promotion of investigational drugs. Do not represent as safe or effective. Avoid speculative superlatives.",
        count: 1
      },
      {
        word: "guaranteed",
        rule: "Merck Brand Guideline Section 4.2: Efficacy claims must be supported by double-blind clinical data. Avoid absolute claims.",
        count: 1
      }
    ],
    assets: [
      {
        name: "zygardia_microbiology_hero.png",
        size: "2.8 MB",
        resolution: "1920 x 1080px",
        url: "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?q=80&w=800",
        status: "Compliant",
        type: "image"
      }
    ],
    status: "Legal Review",
    step: 3,
    budget: 45,
    updatedAt: Date.now() - 3600000 * 2,
    createdAt: Date.now() - 3600000 * 24 * 3
  },
  {
    id: "camp-2",
    name: "Keytruda Adjuvant Briefing",
    brand: "product_b",
    therapeuticArea: "Oncology (Renal Cell Carcinoma)",
    pdfName: "KEYNOTE-564_Brief.pdf",
    metrics: {
      hazard_ratio: "0.68",
      rfs_rate: "77.3%",
      p_value: "0.002"
    },
    copyText: "KEYTRUDA adjuvant therapy demonstrated a statistically significant improvement in recurrence-free survival (HR 0.68, p=0.002) compared to placebo in patients with intermediate-high or high risk of recurrence.",
    complianceScore: 96,
    regulatoryReasoning: "Excellent work. The copy is fully grounded in the provided clinical trial metrics and contains no high-risk absolute claims. It complies with general FDA promotional guidelines.",
    activeViolations: [],
    assets: [
      {
        name: "keytruda_clinical_patient.png",
        size: "2.8 MB",
        resolution: "1920 x 1080px",
        url: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=800",
        status: "Compliant",
        type: "image"
      }
    ],
    status: "Completed",
    step: 5,
    budget: 80,
    updatedAt: Date.now() - 3600000 * 12,
    createdAt: Date.now() - 3600000 * 24 * 5
  }
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    title: "Veeva Sync Successful",
    message: "Campaign 'Keytruda Adjuvant Briefing' has been successfully transmitted to Veeva Vault PromoMats.",
    type: "success",
    timestamp: Date.now() - 3600000 * 12,
    read: false
  },
  {
    id: "notif-2",
    title: "Compliance Alert",
    message: "Campaign 'Zygardia Q3 Launch' was blocked due to a low compliance score (78/100).",
    type: "warning",
    timestamp: Date.now() - 3600000 * 2,
    read: false
  }
];

const MOCK_TRIALS: ClinicalTrial[] = [
  {
    id: "trial-1",
    name: "Zygardia Post-Nephrectomy Phase 3 Study",
    pdfName: "Zygardia_Post_Nephrectomy_Study.pdf",
    metrics: {
      hazard_ratio: "0.58",
      rfs_rate: "78.4%",
      p_value: "<0.001"
    },
    claims: [
      "Significant improvement in recurrence-free survival (RFS) compared to placebo.",
      "Manageable safety profile consistent with previous monotherapy trials.",
      "Recommended for early adjuvant intervention post-nephrectomy."
    ],
    ingestedAt: Date.now() - 3600000 * 24 * 10
  },
  {
    id: "trial-2",
    name: "KEYNOTE-564: Pembrolizumab in Renal Cell Carcinoma",
    pdfName: "KEYNOTE-564_Brief.pdf",
    metrics: {
      hazard_ratio: "0.68",
      rfs_rate: "77.3%",
      p_value: "0.002"
    },
    claims: [
      "Demonstrated statistically significant disease-free survival benefits.",
      "Adjuvant pembrolizumab prolonged disease-free survival in high-risk patients.",
      "Consistent safety endpoints across all patient subsegments."
    ],
    ingestedAt: Date.now() - 3600000 * 24 * 8
  }
];

const MOCK_COHORTS: AudienceCohort[] = [
  { id: "cohort-1", name: "Oncology Specialists (GU)", size: 14200, region: "North America", engagement: 84, status: "Active" },
  { id: "cohort-2", name: "Payer Decision Makers", size: 3800, region: "Europe", engagement: 68, status: "Active" },
  { id: "cohort-3", name: "Urologic Oncologists", size: 8900, region: "Global", engagement: 79, status: "Active" },
  { id: "cohort-4", name: "High-Risk Patient Advocates", size: 25000, region: "North America", engagement: 92, status: "Draft" }
];

const MOCK_TEAM: TeamMember[] = [
  { id: "team-1", name: "Alex Sterling", role: "Regulatory", status: "Active", avatar: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=150" },
  { id: "team-2", name: "Dr. Sarah Jenkins", role: "Medical", status: "Active", avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=150" },
  { id: "team-3", name: "Marcus Vance", role: "Legal", status: "Active", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150" },
  { id: "team-4", name: "Claire Dupont", role: "Brand Manager", status: "Active", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150" }
];

const DEFAULT_SETTINGS: SystemSettings = {
  gatewayMode: "simulation",
  maintenanceMode: false,
  auditLogging: true,
  auditLogs: [
    { timestamp: Date.now() - 3600000 * 2, level: "INFO", message: "Maestro Enterprise Engine initialized." },
    { timestamp: Date.now() - 3600000 * 1.5, level: "SUCCESS", message: "Connected to Veeva Vault API Gateway (Production)." },
    { timestamp: Date.now() - 3600000, level: "INFO", message: "PixelRAG vector database synchronized (142 clinical nodes)." }
  ]
};

// =====================================================================
// PROVIDER IMPLEMENTATION
// =====================================================================

export const CampaignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [clinicalTrials, setClinicalTrials] = useState<ClinicalTrial[]>([]);
  const [audienceCohorts, setAudienceCohorts] = useState<AudienceCohort[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const storedCampaigns = localStorage.getItem("maestro_campaigns");
    const storedNotifications = localStorage.getItem("maestro_notifications");
    const storedTrials = localStorage.getItem("maestro_trials");
    const storedCohorts = localStorage.getItem("maestro_cohorts");
    const storedTeam = localStorage.getItem("maestro_team");
    const storedSettings = localStorage.getItem("maestro_settings");
    const storedActiveId = localStorage.getItem("maestro_active_campaign_id");

    if (storedCampaigns) setCampaigns(JSON.parse(storedCampaigns));
    else {
      setCampaigns(MOCK_CAMPAIGNS);
      localStorage.setItem("maestro_campaigns", JSON.stringify(MOCK_CAMPAIGNS));
    }

    if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
    else {
      setNotifications(MOCK_NOTIFICATIONS);
      localStorage.setItem("maestro_notifications", JSON.stringify(MOCK_NOTIFICATIONS));
    }

    if (storedTrials) setClinicalTrials(JSON.parse(storedTrials));
    else {
      setClinicalTrials(MOCK_TRIALS);
      localStorage.setItem("maestro_trials", JSON.stringify(MOCK_TRIALS));
    }

    if (storedCohorts) setAudienceCohorts(JSON.parse(storedCohorts));
    else {
      setAudienceCohorts(MOCK_COHORTS);
      localStorage.setItem("maestro_cohorts", JSON.stringify(MOCK_COHORTS));
    }

    if (storedTeam) setTeamMembers(JSON.parse(storedTeam));
    else {
      setTeamMembers(MOCK_TEAM);
      localStorage.setItem("maestro_team", JSON.stringify(MOCK_TEAM));
    }

    if (storedSettings) setSettings(JSON.parse(storedSettings));
    else {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem("maestro_settings", JSON.stringify(DEFAULT_SETTINGS));
    }

    if (storedActiveId) setActiveCampaignId(storedActiveId);
  }, []);

  // Helpers to save and sync
  const saveCampaigns = (data: Campaign[]) => {
    setCampaigns(data);
    localStorage.setItem("maestro_campaigns", JSON.stringify(data));
  };

  const saveNotifications = (data: Notification[]) => {
    setNotifications(data);
    localStorage.setItem("maestro_notifications", JSON.stringify(data));
  };

  const saveTrials = (data: ClinicalTrial[]) => {
    setClinicalTrials(data);
    localStorage.setItem("maestro_trials", JSON.stringify(data));
  };

  const saveCohorts = (data: AudienceCohort[]) => {
    setAudienceCohorts(data);
    localStorage.setItem("maestro_cohorts", JSON.stringify(data));
  };

  const saveTeam = (data: TeamMember[]) => {
    setTeamMembers(data);
    localStorage.setItem("maestro_team", JSON.stringify(data));
  };

  const saveSettings = (data: SystemSettings) => {
    setSettings(data);
    localStorage.setItem("maestro_settings", JSON.stringify(data));
  };

  // =====================================================================
  // ACTIONS
  // =====================================================================

  // CAMPAIGNS
  const addCampaign = (campaign: Omit<Campaign, "id" | "createdAt" | "updatedAt">) => {
    const id = `camp-${Date.now()}`;
    const newCampaign: Campaign = {
      ...campaign,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const updated = [newCampaign, ...campaigns];
    saveCampaigns(updated);
    addNotification("New Campaign Created", `Campaign '${campaign.name}' has been initialized.`, "info");
    addAuditLog(`Campaign '${campaign.name}' initialized by Brand Manager.`, "INFO");
    return id;
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    const updated = campaigns.map(c => {
      if (c.id === id) {
        // Log status changes
        if (updates.status && updates.status !== c.status) {
          addAuditLog(`Campaign '${c.name}' status promoted to ${updates.status}.`, "SUCCESS");
        }
        return { ...c, ...updates, updatedAt: Date.now() };
      }
      return c;
    });
    saveCampaigns(updated);
  };

  const deleteCampaign = (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    const updated = campaigns.filter(c => c.id !== id);
    saveCampaigns(updated);
    if (activeCampaignId === id) selectCampaign(null);
    addNotification("Campaign Deleted", "The campaign has been removed from the system.", "warning");
    if (campaign) {
      addAuditLog(`Campaign '${campaign.name}' deleted from repository.`, "WARN");
    }
  };

  const selectCampaign = (id: string | null) => {
    setActiveCampaignId(id);
    if (id) localStorage.setItem("maestro_active_campaign_id", id);
    else localStorage.removeItem("maestro_active_campaign_id");
  };

  // NOTIFICATIONS
  const addNotification = (title: string, message: string, type: "success" | "warning" | "info" = "info") => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: Date.now(),
      read: false
    };
    saveNotifications([newNotif, ...notifications]);
  };

  const clearNotifications = () => saveNotifications([]);
  const markNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  // CLINICAL TRIALS (RAG)
  const ingestTrial = (trial: Omit<ClinicalTrial, "id" | "ingestedAt">) => {
    const id = `trial-${Date.now()}`;
    const newTrial: ClinicalTrial = {
      ...trial,
      id,
      ingestedAt: Date.now()
    };
    const updated = [newTrial, ...clinicalTrials];
    saveTrials(updated);
    addNotification("Clinical Ingestion Complete", `Study '${trial.name}' successfully parsed and indexed via PixelRAG.`, "success");
    addAuditLog(`Clinical Study '${trial.name}' ingested. RAG vector nodes mapped.`, "SUCCESS");
  };

  // AUDIENCE COHORTS
  const addCohort = (cohort: Omit<AudienceCohort, "id">) => {
    const id = `cohort-${Date.now()}`;
    const newCohort: AudienceCohort = { ...cohort, id };
    const updated = [newCohort, ...audienceCohorts];
    saveCohorts(updated);
    addNotification("Audience Cohort Defined", `Cohort '${cohort.name}' is now active.`, "success");
    addAuditLog(`Audience Cohort '${cohort.name}' created (Size: ${cohort.size.toLocaleString()} patients).`, "INFO");
  };

  const updateCohort = (id: string, updates: Partial<AudienceCohort>) => {
    const updated = audienceCohorts.map(c => c.id === id ? { ...c, ...updates } : c);
    saveCohorts(updated);
    addAuditLog(`Audience Cohort '${id}' parameters updated.`, "INFO");
  };

  const deleteCohort = (id: string) => {
    const cohort = audienceCohorts.find(c => c.id === id);
    const updated = audienceCohorts.filter(c => c.id !== id);
    saveCohorts(updated);
    addNotification("Cohort Removed", "Audience cohort deleted.", "warning");
    if (cohort) {
      addAuditLog(`Audience Cohort '${cohort.name}' removed.`, "WARN");
    }
  };

  // TEAM GOVERNANCE
  const addTeamMember = (member: Omit<TeamMember, "id" | "avatar">) => {
    const id = `team-${Date.now()}`;
    // Assign a random high-quality avatar
    const avatars = [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150"
    ];
    const avatar = avatars[Math.floor(Math.random() * avatars.length)];
    const newMember: TeamMember = { ...member, id, avatar };
    const updated = [...teamMembers, newMember];
    saveTeam(updated);
    addNotification("User Onboarded", `User '${member.name}' has been assigned the role of ${member.role}.`, "success");
    addAuditLog(`User '${member.name}' onboarded as ${member.role}.`, "INFO");
  };

  const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
    const updated = teamMembers.map(t => t.id === id ? { ...t, ...updates } : t);
    saveTeam(updated);
    addAuditLog(`User profile '${id}' permissions modified.`, "INFO");
  };

  const deleteTeamMember = (id: string) => {
    const member = teamMembers.find(t => t.id === id);
    const updated = teamMembers.filter(t => t.id !== id);
    saveTeam(updated);
    addNotification("User Offboarded", "The team member has been removed from the directory.", "warning");
    if (member) {
      addAuditLog(`User '${member.name}' offboarded from system.`, "WARN");
    }
  };

  const updateSettings = (updates: Partial<Omit<SystemSettings, "auditLogs">>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      const newLog = { timestamp: Date.now(), level: "INFO" as const, message: "System configurations updated." };
      const updatedLogs = [newLog, ...newSettings.auditLogs].slice(0, 50);
      const finalSettings = { ...newSettings, auditLogs: updatedLogs };
      localStorage.setItem("maestro_settings", JSON.stringify(finalSettings));
      return finalSettings;
    });
  };

  const addAuditLog = (message: string, level: "INFO" | "WARN" | "SUCCESS" = "INFO") => {
    setSettings(prev => {
      const newLog = { timestamp: Date.now(), level, message };
      const updatedLogs = [newLog, ...prev.auditLogs].slice(0, 50);
      const newSettings = { ...prev, auditLogs: updatedLogs };
      localStorage.setItem("maestro_settings", JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const clearAuditLogs = () => {
    const newSettings = { ...settings, auditLogs: [] };
    saveSettings(newSettings);
  };

  const activeCampaign = campaigns.find(c => c.id === activeCampaignId) || null;

  return (
    <CampaignContext.Provider
      value={{
        // Campaigns
        campaigns,
        activeCampaignId,
        activeCampaign,
        addCampaign,
        updateCampaign,
        deleteCampaign,
        selectCampaign,
        
        // Notifications
        notifications,
        addNotification,
        clearNotifications,
        markNotificationsAsRead,

        // Clinical Trials
        clinicalTrials,
        ingestTrial,

        // Audience Cohorts
        audienceCohorts,
        addCohort,
        updateCohort,
        deleteCohort,

        // Team Governance
        teamMembers,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,

        // Settings
        settings,
        updateSettings,
        addAuditLog,
        clearAuditLogs
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaign = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error("useCampaign must be used within a CampaignProvider");
  }
  return context;
};
