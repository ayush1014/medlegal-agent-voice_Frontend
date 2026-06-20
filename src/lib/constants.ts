import type {
  CaseType,
  QualificationStatus,
  LeadTemperature,
  PipelineStatus,
  RetainerStatus,
} from "@/types/lead";

// Single source of truth for the controlled vocabularies used across filters,
// badges and forms. Keep these aligned with the backend enums.

export const CASE_TYPES: CaseType[] = [
  "Auto Accident",
  "Truck Accident",
  "Motorcycle Accident",
  "Pedestrian Accident",
  "Rideshare Accident",
  "Slip and Fall",
  "Dog Bite",
  "Workplace Injury",
  "Premises Liability",
  "Wrongful Death",
  "Other Personal Injury",
];

export const QUALIFICATION_STATUSES: QualificationStatus[] = [
  "Qualified",
  "Possibly Qualified",
  "Needs Review",
  "Unqualified",
];

export const LEAD_TEMPERATURES: LeadTemperature[] = [
  "Hot",
  "Warm",
  "Low",
  "Poor Fit",
];

export const PIPELINE_STATUSES: PipelineStatus[] = [
  "New Lead",
  "Intake Started",
  "Intake Complete",
  "Qualified",
  "Needs Review",
  "Docs Requested",
  "Docs Received",
  "Retainer Ready",
  "Retainer Sent",
  "Signed",
  "Rejected",
  "Closed",
];

export const RETAINER_STATUSES: RetainerStatus[] = [
  "Not Ready",
  "Ready",
  "Sent",
  "Viewed",
  "Signed",
  "Declined",
  "Expired",
];

// Documents commonly requested for a personal-injury case.
export const REQUESTABLE_DOCUMENTS = [
  "Police report",
  "Accident photos",
  "Injury photos",
  "Medical records",
  "Medical bills",
  "Insurance correspondence",
  "Driver's license",
  "Vehicle damage photos",
  "Witness information",
  "Employer wage loss documentation",
  "Prior settlement offers",
] as const;
