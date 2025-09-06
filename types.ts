// Enums
export enum Language {
    EN = 'en',
    FR = 'fr',
}

export enum Module {
    Summary = 'Summary',
    Property = 'Property',
    Units = 'Units',
    Owners = 'Owners',
    Committee = 'Committee',
    RegularBudget = 'RegularBudget',
    ExceptionalBudget = 'ExceptionalBudget',
    Reports = 'Reports',
    Documents = 'Documents',
    Archive = 'Archive',
}

export enum AmountType {
    FIXED = 'fixed',
    PERCENTAGE = 'percentage',
}

export enum PaymentStatus {
    UNPAID = 'UNPAID',
    PARTIALLY_PAID = 'PARTIALLY_PAID',
    PAID = 'PAID',
    PAUSED = 'PAUSED',
}

export enum ContributionStatus {
    NOT_PAID = 'NOT_PAID',
    PARTIALLY_PAID = 'PARTIALLY_PAID',
    FULLY_PAID = 'FULLY_PAID',
}

// Interfaces
export interface Fee {
    amount: number;
    type: AmountType;
}

export interface PropertyDetails {
  address: string;
  city: string;
  zipCode: string;
  country: string;
  constructionDate: string; // ISO date string
  ownershipTitle: string;
  associationName: string;
  currency: string;
  logoUrl: string;
  customLogo: string; // base64
  url: string;
  email: string;
  phone: string;
  totalUnits: number;
  totalMembers: number;
  latitude: number | null;
  longitude: number | null;
  presidentSignature: string; // base64
  associationStamp: string; // base64
  budgetFutureYears: number;
}

export interface Property {
  id: string;
  name: string;
  details: PropertyDetails;
}

export interface UnitType {
    id: string;
    propertyId: string;
    name: string;
    description: string;
    surface: number;
}

export interface Unit {
    id: string;
    propertyId: string;
    ownerId: string;
    code?: string;
    unitTypeId: string;
}

export interface RenterDetails {
    fullName: string;
    address: string;
    phone: string;
    email: string;
}

export interface Owner {
    id: string;
    propertyId: string;
    isActive: boolean;
    fullName: string;
    address: string;
    phone: string;
    email: string;
    bankAccountNumber: string;
    ownershipTitleCode: string;
    isRented: boolean;
    displayRenter: boolean;
    joinDate: string; // ISO date string
    renterDetails: RenterDetails;
}

export interface CommitteeMember {
    id: string;
    propertyId: string;
    ownerId: string | null;
    fullName: string;
    position: string;
    photoUrl?: string;
}

export interface MonthlyPayment {
    id: string; // propertyId-ownerId-year-month
    propertyId: string;
    ownerId: string;
    year: number;
    month: number; // 0-11
    amountDue: number;
    amountPaid: number;
    status: PaymentStatus;
    paymentDate?: string; // ISO date string
}

export interface PaymentHistoryEntry {
    transactionId: string;
    paymentId: string;
    propertyId: string;
    ownerId: string;
    year: number;
    month: number;
    amountPaid: number;
    transactionDate: string; // ISO date string
    previousAmount: number;
    newAmount: number;
    notes?: string;
}

export interface UnitTypeFeePolicy {
    id: string; // propertyId-year-unitTypeId
    propertyId: string;
    year: number;
    unitTypeId: string;
    baseFee: number;
    penalty: Fee;
    discount: Fee;
}

export interface ExpenseCategory {
    id: string;
    propertyId: string;
    name: string;
    isPredefined: boolean;
    isArchived: boolean;
}

export interface MonthlyOutcome {
    id: string; // propertyId-year-month-categoryId
    propertyId: string;
    year: number;
    month: number;
    categoryId: string;
    amount: number;
    photoUrl?: string;
    isConfirmed: boolean;
    confirmedAt?: string; // ISO date string
    notes?: string;
}

export interface OutcomeTransaction {
    id: string;
    propertyId: string;
    year: number;
    month: number;
    amount: number;
    category: string;
    description: string;
    transactionDate: string; // ISO date string
}

export interface ExceptionalProject {
    id: string;
    propertyId: string;
    year: number;
    name: string;
    description: string;
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    expectedIncome: number;
    expectedOutcome: number;
}

export interface ExceptionalContribution {
    id: string; // projectId-ownerId
    projectId: string;
    ownerId: string;
    expectedAmount: number;
    paidAmount: number;
    status: ContributionStatus;
}

export interface ExternalContributor {
    id: string;
    projectId: string;
    fullName: string;
    address: string;
    phone: string;
    email: string;
    expectedAmount: number;
    paidAmount: number;
    status: ContributionStatus;
}

export interface ExceptionalOutcome {
    id: string;
    projectId: string;
    description: string;
    amount: number;
    date: string; // ISO date string
    photoUrl?: string;
    isConfirmed: boolean;
    confirmedAt?: string; // ISO date string
    notes?: string;
}

export interface ExceptionalPaymentHistoryEntry {
    transactionId: string;
    projectId: string;
    contributorId: string;
    contributorType: 'owner' | 'external';
    amountPaid: number;
    transactionDate: string; // ISO date string
    previousAmount: number;
    newAmount: number;
}

export interface ArchivedDocument {
    id: string;
    propertyId: string;
    name: string;
    year: number;
    fileUrl: string; // base64 data URL
    fileType: string; // e.g., 'image/png'
    uploadDate: string; // ISO date string
    source: string;
}