// Core domain types for the personal-injury intake platform. These mirror the
// backend data model (FastAPI + Postgres) so the same shapes flow end to end.

export type CaseType =
  | "Auto Accident"
  | "Truck Accident"
  | "Motorcycle Accident"
  | "Pedestrian Accident"
  | "Rideshare Accident"
  | "Slip and Fall"
  | "Dog Bite"
  | "Workplace Injury"
  | "Premises Liability"
  | "Wrongful Death"
  | "Other Personal Injury";

export type QualificationStatus =
  | "Qualified"
  | "Possibly Qualified"
  | "Needs Review"
  | "Unqualified";

export type LeadTemperature = "Hot" | "Warm" | "Low" | "Poor Fit";

export type PipelineStatus =
  | "New Lead"
  | "Intake Started"
  | "Intake Complete"
  | "Qualified"
  | "Needs Review"
  | "Docs Requested"
  | "Docs Received"
  | "Retainer Ready"
  | "Retainer Sent"
  | "Signed"
  | "Rejected"
  | "Closed";

export type RetainerStatus =
  | "Not Ready"
  | "Ready"
  | "Sent"
  | "Viewed"
  | "Signed"
  | "Declined"
  | "Expired";

export type SettlementConfidence = "Low" | "Medium" | "High";

// The dashboard list/detail shape returned by GET /api/leads (headline fields).
// Full case detail (incident/injury/etc.) arrives with the API-layer PRD.
export interface LeadSummary {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  caseType: CaseType;
  incidentDate?: string;
  qualificationStatus: QualificationStatus;
  leadScore: number;
  leadTemperature: LeadTemperature;
  settlementExpected?: number;
  pipelineStatus: PipelineStatus;
  retainerStatus: RetainerStatus;
  missingDocuments: number;
  aiSummary?: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  preferredContactMethod?: string;
  bestTimeToContact?: string;
  caseType: CaseType;
  incidentDate?: string;
  incidentLocation?: string;
  incidentDescription: string;
  injurySummary?: string;
  painLevel?: number;
  medicalTreatmentReceived: boolean;
  treatmentDetails?: string;
  missedWork: boolean;
  lostWagesEstimate?: number;
  hasAttorney: boolean;
  spokeWithInsurance: boolean;
  policeReportAvailable: boolean;
  insuranceAvailable: boolean;
  qualificationStatus: QualificationStatus;
  qualificationReason?: string;
  leadScore: number;
  leadTemperature: LeadTemperature;
  scoreReasoning?: string[];
  settlementLow?: number;
  settlementExpected?: number;
  settlementHigh?: number;
  settlementConfidence?: SettlementConfidence;
  pipelineStatus: PipelineStatus;
  retainerStatus: RetainerStatus;
  aiSummary?: string;
  missingDocuments?: number;
  lastFollowUpAt?: string;
  createdAt: string;
  updatedAt: string;
}
