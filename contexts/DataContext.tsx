import React, { createContext, useState, useContext, ReactNode, useEffect, useRef, useCallback } from 'react';
import { Property, Module, PropertyDetails, UnitType, Unit, Owner, CommitteeMember, MonthlyPayment, PaymentStatus, PaymentHistoryEntry, UnitTypeFeePolicy, Fee, ExpenseCategory, MonthlyOutcome, OutcomeTransaction, AmountType, ExceptionalProject, ExceptionalContribution, ContributionStatus, ExternalContributor, ExceptionalOutcome, ExceptionalPaymentHistoryEntry, ArchivedDocument } from '../types';
import { useLanguage } from './LanguageContext';
import { TranslationKey } from '../lib/translations';

interface DataContextType {
  properties: Property[];
  selectedProperty: Property | null;
  activeModule: Module | null;
  unitTypes: UnitType[];
  units: Unit[];
  owners: Owner[];
  committeeMembers: CommitteeMember[];
  monthlyPayments: MonthlyPayment[];
  paymentHistory: PaymentHistoryEntry[];
  unitTypeFeePolicies: UnitTypeFeePolicy[];
  expenseCategories: ExpenseCategory[];
  monthlyOutcomes: MonthlyOutcome[];
  outcomeTransactions: OutcomeTransaction[];
  exceptionalProjects: ExceptionalProject[];
  exceptionalContributions: ExceptionalContribution[];
  externalContributors: ExternalContributor[];
  exceptionalOutcomes: ExceptionalOutcome[];
  exceptionalPaymentHistory: ExceptionalPaymentHistoryEntry[];
  archivedDocuments: ArchivedDocument[];


  addProperty: (name: string) => void;
  editProperty: (id: string, newName: string) => void;
  updatePropertyDetails: (id: string, details: Partial<PropertyDetails>) => void;
  deleteProperty: (id: string) => void;
  selectProperty: (property: Property | null) => void;
  setActiveModule: (module: Module | null) => void;
  addUnitType: (unitTypeData: Omit<UnitType, 'id'>) => void;
  editUnitType: (id: string, updates: Partial<Omit<UnitType, 'id' | 'propertyId'>>) => void;
  deleteUnitType: (id: string) => void;
  isUnitTypeInUse: (id: string) => boolean;
  isUnitCodeUnique: (code: string | undefined, unitIdToExclude?: string) => boolean;
  isOwnershipTitleCodeUnique: (code: string, ownerIdToExclude?: string) => boolean;
  addOwnerWithUnit: (ownerData: Omit<Owner, 'id' | 'propertyId' | 'isActive'>, unitData: { code?: string, unitTypeId: string }) => void;
  editOwnerWithUnit: (ownerId: string, ownerUpdates: Partial<Omit<Owner, 'id' | 'propertyId'>>, unitId: string, unitUpdates: Partial<Omit<Unit, 'id' | 'propertyId' | 'ownerId'>>) => void;
  toggleOwnerStatus: (ownerId: string) => void;
  getUnitsByOwner: (ownerId: string) => Unit[];
  addCommitteeMember: (memberData: Omit<CommitteeMember, 'id'>) => void;
  editCommitteeMember: (id: string, updates: Partial<Omit<CommitteeMember, 'id' | 'propertyId'>>) => void;
  deleteCommitteeMember: (id: string) => void;
  getPaymentsForYear: (propertyId: string, year: number) => MonthlyPayment[];
  recordPayment: (paymentData: Omit<MonthlyPayment, 'id' | 'status'>, adjustedAmountDue: number) => void;
  setPaymentStatus: (paymentId: string, status: PaymentStatus, basePaymentData: Omit<MonthlyPayment, 'id' | 'amountPaid' | 'status'>) => void;
  getUnitTypeFeePolicy: (propertyId: string, year: number, unitTypeId: string) => UnitTypeFeePolicy;
  updateUnitTypeFeePolicies: (propertyId: string, year: number, policies: { unitTypeId: string; baseFee: number; penalty: Fee; discount: Fee }[]) => void;
  getOverdueDetailsForOwner: (ownerId: string) => { totalDue: number; months: { year: number; month: number; amount: number }[] };
  
  // Expense/Outcome Management
  initializeExpenseCategories: (propertyId: string) => ExpenseCategory[];
  getExpenseCategoriesForProperty: (propertyId: string) => ExpenseCategory[];
  addExpenseCategory: (propertyId: string, name: string) => void;
  updateExpenseCategory: (categoryId: string, newName: string) => void;
  archiveExpenseCategory: (categoryId: string) => void;
  isExpenseCategoryInUse: (categoryId: string) => boolean;
  getMonthlyOutcomesForYear: (propertyId: string, year: number) => MonthlyOutcome[];
  updateMonthlyOutcome: (outcomeData: Omit<MonthlyOutcome, 'id'>) => void;
  cancelMonthlyOutcome: (outcome: MonthlyOutcome, reason: string) => void;

  // Exceptional Budget
  addExceptionalProject: (projectData: Omit<ExceptionalProject, 'id' | 'propertyId'>) => void;
  editExceptionalContribution: (id: string, updates: Partial<Omit<ExceptionalContribution, 'id' | 'projectId' | 'ownerId'>>) => void;
  addExternalContributor: (contributorData: Omit<ExternalContributor, 'id' | 'paidAmount' | 'status'>) => void;
  editExternalContributor: (id: string, updates: Partial<Omit<ExternalContributor, 'id' | 'projectId'>>) => void;
  recordExceptionalPayment: (projectId: string, contributorId: string, contributorType: 'owner' | 'external', amount: number) => void;
  addExceptionalOutcome: (outcomeData: Omit<ExceptionalOutcome, 'id' | 'isConfirmed' | 'confirmedAt'>) => void;
  confirmExceptionalOutcome: (outcomeId: string) => void;
  cancelExceptionalOutcome: (outcomeId: string, reason: string) => void;

  // Archive
  addArchivedDocument: (docData: Omit<ArchivedDocument, 'id' | 'propertyId' | 'uploadDate'>) => void;
  deleteArchivedDocument: (docId: string) => void;

  // Data Management
  backupData: () => void;
  restoreData: (fileContent: string) => Promise<void>;

  // Unsaved changes flow
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  isUnsavedChangesModalOpen: boolean;
  showUnsavedChangesModal: (onNavigate: () => void) => void;
  handleSaveChangesAndNavigate: () => Promise<void>;
  handleDiscardChangesAndNavigate: () => void;
  handleCancelNavigation: () => void;
  registerActions: (save: () => Promise<void>, discard: () => void) => void;
  unregisterActions: () => void;

  // Success message
  successMessage: string;
  showSuccessMessage: (message: string) => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useLanguage();
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('hoa-properties');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeModule, setActiveModule] = useState<Module | null>(null);

  const [unitTypes, setUnitTypes] = useState<UnitType[]>(() => {
    const saved = localStorage.getItem('hoa-unit-types');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [units, setUnits] = useState<Unit[]>(() => {
    const saved = localStorage.getItem('hoa-units');
    return saved ? JSON.parse(saved) : [];
  });

  const [owners, setOwners] = useState<Owner[]>(() => {
    const saved = localStorage.getItem('hoa-owners');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>(() => {
    const saved = localStorage.getItem('hoa-committee-members');
    return saved ? JSON.parse(saved) : [];
  });

  const [monthlyPayments, setMonthlyPayments] = useState<MonthlyPayment[]>(() => {
    const saved = localStorage.getItem('hoa-monthly-payments');
    return saved ? JSON.parse(saved) : [];
  });

  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryEntry[]>(() => {
    const saved = localStorage.getItem('hoa-payment-history');
    return saved ? JSON.parse(saved) : [];
  });

  const [unitTypeFeePolicies, setUnitTypeFeePolicies] = useState<UnitTypeFeePolicy[]>(() => {
    const saved = localStorage.getItem('hoa-unit-type-fee-policies');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(() => {
    const saved = localStorage.getItem('hoa-expense-categories');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [monthlyOutcomes, setMonthlyOutcomes] = useState<MonthlyOutcome[]>(() => {
    const saved = localStorage.getItem('hoa-monthly-outcomes');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [outcomeTransactions, setOutcomeTransactions] = useState<OutcomeTransaction[]>(() => {
    const saved = localStorage.getItem('hoa-outcome-transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // Exceptional Budget State
  const [exceptionalProjects, setExceptionalProjects] = useState<ExceptionalProject[]>(() => {
    const saved = localStorage.getItem('hoa-exceptional-projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [exceptionalContributions, setExceptionalContributions] = useState<ExceptionalContribution[]>(() => {
    const saved = localStorage.getItem('hoa-exceptional-contributions');
    return saved ? JSON.parse(saved) : [];
  });
  const [externalContributors, setExternalContributors] = useState<ExternalContributor[]>(() => {
    const saved = localStorage.getItem('hoa-external-contributors');
    return saved ? JSON.parse(saved) : [];
  });
  const [exceptionalOutcomes, setExceptionalOutcomes] = useState<ExceptionalOutcome[]>(() => {
    const saved = localStorage.getItem('hoa-exceptional-outcomes');
    return saved ? JSON.parse(saved) : [];
  });
  const [exceptionalPaymentHistory, setExceptionalPaymentHistory] = useState<ExceptionalPaymentHistoryEntry[]>(() => {
    const saved = localStorage.getItem('hoa-exceptional-payment-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [archivedDocuments, setArchivedDocuments] = useState<ArchivedDocument[]>(() => {
    const saved = localStorage.getItem('hoa-archived-documents');
    return saved ? JSON.parse(saved) : [];
  });

  // State for unsaved changes flow
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const saveCallback = useRef<(() => Promise<void>) | null>(null);
  const discardCallback = useRef<(() => void) | null>(null);
  const pendingNavigation = useRef<(() => void) | null>(null);

  useEffect(() => { localStorage.setItem('hoa-properties', JSON.stringify(properties)); }, [properties]);
  useEffect(() => { localStorage.setItem('hoa-unit-types', JSON.stringify(unitTypes)); }, [unitTypes]);
  useEffect(() => { localStorage.setItem('hoa-units', JSON.stringify(units)); }, [units]);
  useEffect(() => { localStorage.setItem('hoa-owners', JSON.stringify(owners)); }, [owners]);
  useEffect(() => { localStorage.setItem('hoa-committee-members', JSON.stringify(committeeMembers)); }, [committeeMembers]);
  useEffect(() => { localStorage.setItem('hoa-monthly-payments', JSON.stringify(monthlyPayments)); }, [monthlyPayments]);
  useEffect(() => { localStorage.setItem('hoa-payment-history', JSON.stringify(paymentHistory)); }, [paymentHistory]);
  useEffect(() => { localStorage.setItem('hoa-unit-type-fee-policies', JSON.stringify(unitTypeFeePolicies)); }, [unitTypeFeePolicies]);
  useEffect(() => { localStorage.setItem('hoa-expense-categories', JSON.stringify(expenseCategories)); }, [expenseCategories]);
  useEffect(() => { localStorage.setItem('hoa-monthly-outcomes', JSON.stringify(monthlyOutcomes)); }, [monthlyOutcomes]);
  useEffect(() => { localStorage.setItem('hoa-outcome-transactions', JSON.stringify(outcomeTransactions)); }, [outcomeTransactions]);
  useEffect(() => { localStorage.setItem('hoa-archived-documents', JSON.stringify(archivedDocuments)); }, [archivedDocuments]);
  // Exceptional Budget persistence
  useEffect(() => { localStorage.setItem('hoa-exceptional-projects', JSON.stringify(exceptionalProjects)); }, [exceptionalProjects]);
  useEffect(() => { localStorage.setItem('hoa-exceptional-contributions', JSON.stringify(exceptionalContributions)); }, [exceptionalContributions]);
  useEffect(() => { localStorage.setItem('hoa-external-contributors', JSON.stringify(externalContributors)); }, [externalContributors]);
  useEffect(() => { localStorage.setItem('hoa-exceptional-outcomes', JSON.stringify(exceptionalOutcomes)); }, [exceptionalOutcomes]);
  useEffect(() => { localStorage.setItem('hoa-exceptional-payment-history', JSON.stringify(exceptionalPaymentHistory)); }, [exceptionalPaymentHistory]);

  const addProperty = useCallback((name: string) => {
    const newProperty: Property = { 
      id: Date.now().toString(), 
      name,
      details: {
        address: '',
        city: '',
        zipCode: '',
        country: '',
        constructionDate: '',
        ownershipTitle: '',
        associationName: '',
        currency: 'USD',
        logoUrl: 'logo1', // Default logo
        customLogo: '',
        url: '',
        email: '',
        phone: '',
        totalUnits: 0,
        totalMembers: 0,
        latitude: null,
        longitude: null,
        presidentSignature: '',
        associationStamp: '',
        budgetFutureYears: 3, // Default to 3 years
      } 
    };
    setProperties(prev => [...prev, newProperty]);
  }, []);

  const editProperty = useCallback((id: string, newName: string) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
    if (selectedProperty?.id === id) {
      setSelectedProperty(prev => prev ? { ...prev, name: newName } : null);
    }
  }, [selectedProperty]);

  const updatePropertyDetails = useCallback((id: string, details: Partial<PropertyDetails>) => {
    setProperties(prev => prev.map(p => 
      p.id === id ? { ...p, details: { ...p.details, ...details } } : p
    ));
    if (selectedProperty?.id === id) {
      setSelectedProperty(prev => prev ? { ...prev, details: { ...prev.details, ...details } } : null);
    }
  }, [selectedProperty]);

  const deleteProperty = useCallback((id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
    if (selectedProperty?.id === id) {
      setSelectedProperty(null);
      setActiveModule(null);
    }
  }, [selectedProperty]);

  const selectProperty = useCallback((property: Property | null) => {
    setSelectedProperty(property);
    if(property) {
        setActiveModule(Module.Summary);
    } else {
        setActiveModule(null);
    }
  }, []);

  const addUnitType = useCallback((unitTypeData: Omit<UnitType, 'id'>) => {
    const newUnitType: UnitType = { id: Date.now().toString(), ...unitTypeData };
    setUnitTypes(prev => [...prev, newUnitType]);
  }, []);

  const editUnitType = useCallback((id: string, updates: Partial<Omit<UnitType, 'id' | 'propertyId'>>) => {
    setUnitTypes(prev => prev.map(ut => ut.id === id ? { ...ut, ...updates } : ut));
  }, []);

  const isUnitTypeInUse = useCallback((id: string): boolean => {
    return units.some(unit => unit.unitTypeId === id);
  }, [units]);

  const deleteUnitType = useCallback((id: string) => {
    if (isUnitTypeInUse(id)) {
      console.error("Attempted to delete a unit type that is in use.");
      return;
    }
    setUnitTypes(prev => prev.filter(ut => ut.id !== id));
    setUnitTypeFeePolicies(prev => prev.filter(p => p.unitTypeId !== id));
  }, [isUnitTypeInUse]);
  
  const isUnitCodeUnique = useCallback((code: string | undefined, unitIdToExclude?: string): boolean => {
    if (!selectedProperty) return true;
    if (!code || !code.trim()) return true; // Empty/whitespace codes are allowed
    const trimmedCode = code.trim().toLowerCase();
    return !units.some(u => 
        u.propertyId === selectedProperty.id && 
        u.code?.trim().toLowerCase() === trimmedCode &&
        u.id !== unitIdToExclude
    );
  }, [units, selectedProperty]);

  const isOwnershipTitleCodeUnique = useCallback((code: string, ownerIdToExclude?: string): boolean => {
    if (!selectedProperty) return true;
    if (!code || !code.trim()) return true;
    const trimmedCode = code.trim().toLowerCase();
    return !owners.some(o =>
        o.propertyId === selectedProperty.id &&
        o.ownershipTitleCode.trim().toLowerCase() === trimmedCode &&
        o.id !== ownerIdToExclude
    );
  }, [owners, selectedProperty]);

  const addOwnerWithUnit = useCallback((ownerData: Omit<Owner, 'id' | 'propertyId' | 'isActive'>, unitData: { code?: string, unitTypeId: string }) => {
    if (!selectedProperty) return;

    if (unitData.code && !isUnitCodeUnique(unitData.code)) {
        alert(t('unit_code_exists_error'));
        return;
    }
    if (ownerData.ownershipTitleCode && !isOwnershipTitleCodeUnique(ownerData.ownershipTitleCode)) {
        alert(t('ownership_title_code_exists_error'));
        return;
    }

    const newOwner: Owner = {
        id: `owner_${Date.now()}`,
        propertyId: selectedProperty.id,
        isActive: true,
        ...ownerData,
    };
    setOwners(prev => [...prev, newOwner]);

    const newUnit: Unit = {
        id: `unit_${Date.now()}`,
        propertyId: selectedProperty.id,
        ownerId: newOwner.id,
        code: unitData.code,
        unitTypeId: unitData.unitTypeId,
    };
    setUnits(prev => [...prev, newUnit]);
  }, [selectedProperty, isUnitCodeUnique, isOwnershipTitleCodeUnique, t]);

  const editOwnerWithUnit = useCallback((ownerId: string, ownerUpdates: Partial<Omit<Owner, 'id' | 'propertyId'>>, unitId: string, unitUpdates: Partial<Omit<Unit, 'id' | 'propertyId' | 'ownerId'>>) => {
    if (unitUpdates.code !== undefined && !isUnitCodeUnique(unitUpdates.code, unitId)) {
        alert(t('unit_code_exists_error'));
        return;
    }
    if (ownerUpdates.ownershipTitleCode !== undefined && !isOwnershipTitleCodeUnique(ownerUpdates.ownershipTitleCode, ownerId)) {
        alert(t('ownership_title_code_exists_error'));
        return;
    }
    setOwners(prev => prev.map(o => o.id === ownerId ? { ...o, ...ownerUpdates } : o));
    setUnits(prev => prev.map(u => u.id === unitId ? { ...u, ...unitUpdates } : u));
  }, [isUnitCodeUnique, isOwnershipTitleCodeUnique, t]);
  
  const toggleOwnerStatus = useCallback((ownerId: string) => {
    setOwners(prev => prev.map(o => o.id === ownerId ? { ...o, isActive: !o.isActive } : o));
  }, []);

  const getUnitsByOwner = useCallback((ownerId: string): Unit[] => {
    return units.filter(u => u.ownerId === ownerId);
  }, [units]);

  const addCommitteeMember = useCallback((memberData: Omit<CommitteeMember, 'id'>) => {
    const newMember: CommitteeMember = { id: `cm_${Date.now()}`, ...memberData };
    setCommitteeMembers(prev => [...prev, newMember]);
  }, []);

  const editCommitteeMember = useCallback((id: string, updates: Partial<Omit<CommitteeMember, 'id' | 'propertyId'>>) => {
    setCommitteeMembers(prev => prev.map(cm => cm.id === id ? { ...cm, ...updates } : cm));
  }, []);

  const deleteCommitteeMember = useCallback((id: string) => {
    setCommitteeMembers(prev => prev.filter(cm => cm.id !== id));
  }, []);

  const getPaymentsForYear = useCallback((propertyId: string, year: number): MonthlyPayment[] => {
    return monthlyPayments.filter(p => p.propertyId === propertyId && p.year === year);
  }, [monthlyPayments]);

  const recordPayment = useCallback((paymentData: Omit<MonthlyPayment, 'id' | 'status'>, adjustedAmountDue: number) => {
    const { propertyId, ownerId, year, month, amountDue, amountPaid } = paymentData;
    const id = `${propertyId}-${ownerId}-${year}-${month}`;

    const existingPayment = monthlyPayments.find(p => p.id === id);
    const previousAmount = existingPayment?.amountPaid || 0;
    const newTotalAmount = previousAmount + amountPaid;

    let status: PaymentStatus;
    if (newTotalAmount <= 0) {
        status = PaymentStatus.UNPAID;
    } else if (newTotalAmount < adjustedAmountDue) {
        status = PaymentStatus.PARTIALLY_PAID;
    } else {
        status = PaymentStatus.PAID;
    }
    
    const newPayment: MonthlyPayment = { 
        id, 
        ...paymentData,
        amountPaid: newTotalAmount,
        status, 
    };

    setMonthlyPayments(prev => {
        const existingIndex = prev.findIndex(p => p.id === id);
        if (existingIndex > -1) {
            const updatedPayments = [...prev];
            updatedPayments[existingIndex] = newPayment;
            return updatedPayments;
        }
        return [...prev, newPayment];
    });

    // Log the transaction
    const historyEntry: PaymentHistoryEntry = {
        transactionId: `txn_${Date.now()}`,
        paymentId: id,
        propertyId,
        ownerId,
        year,
        month,
        amountPaid: amountPaid, // The amount of this specific transaction
        transactionDate: new Date().toISOString(),
        previousAmount: previousAmount,
        newAmount: newTotalAmount,
        notes: status === PaymentStatus.PAID ? 'full_payment' : 'partial_payment',
    };
    setPaymentHistory(prev => [...prev, historyEntry]);
  }, [monthlyPayments]);

  const setPaymentStatus = useCallback((paymentId: string, status: PaymentStatus, basePaymentData: Omit<MonthlyPayment, 'id' | 'amountPaid' | 'status'>) => {
     setMonthlyPayments(prev => {
        const existingIndex = prev.findIndex(p => p.id === paymentId);
        if (existingIndex > -1) {
            const updatedPayments = [...prev];
            updatedPayments[existingIndex].status = status;
            return updatedPayments;
        } else {
            // If no payment exists, create one to hold the paused status
            const newPausedPayment: MonthlyPayment = {
                id: paymentId,
                ...basePaymentData,
                amountPaid: 0,
                status: status,
            };
            return [...prev, newPausedPayment];
        }
    });
  }, []);
  
  const getUnitTypeFeePolicy = useCallback((propertyId: string, year: number, unitTypeId: string): UnitTypeFeePolicy => {
    const existingPolicy = unitTypeFeePolicies.find(p => p.propertyId === propertyId && p.year === year && p.unitTypeId === unitTypeId);
    if (existingPolicy) {
        return existingPolicy;
    }

    // If no policy for the current year, find the most recent previous year's policy
    const previousPolicies = unitTypeFeePolicies
        .filter(p => p.propertyId === propertyId && p.unitTypeId === unitTypeId && p.year < year)
        .sort((a, b) => b.year - a.year);

    const basePolicy = previousPolicies[0];

    const newPolicy: UnitTypeFeePolicy = {
        id: `${propertyId}-${year}-${unitTypeId}`,
        propertyId,
        year,
        unitTypeId,
        baseFee: basePolicy?.baseFee || 0,
        penalty: basePolicy?.penalty || { amount: 0, type: AmountType.PERCENTAGE },
        discount: basePolicy?.discount || { amount: 0, type: AmountType.PERCENTAGE },
    };

    // Automatically create and save the new policy for the year
    setUnitTypeFeePolicies(prev => [...prev, newPolicy]);
    return newPolicy;
  }, [unitTypeFeePolicies]);
  
  const updateUnitTypeFeePolicies = useCallback((propertyId: string, year: number, policies: { unitTypeId: string; baseFee: number; penalty: Fee; discount: Fee }[]) => {
    setUnitTypeFeePolicies(prev => {
        const updatedPolicies = [...prev];

        policies.forEach(policyUpdate => {
            const id = `${propertyId}-${year}-${policyUpdate.unitTypeId}`;
            const existingIndex = updatedPolicies.findIndex(p => p.id === id);

            const newPolicy: UnitTypeFeePolicy = {
                id,
                propertyId,
                year,
                unitTypeId: policyUpdate.unitTypeId,
                baseFee: policyUpdate.baseFee,
                penalty: policyUpdate.penalty,
                discount: policyUpdate.discount,
            };

            if (existingIndex > -1) {
                updatedPolicies[existingIndex] = newPolicy;
            } else {
                updatedPolicies.push(newPolicy);
            }
        });

        return updatedPolicies;
    });
  }, []);

    // Expense/Outcome Management
    const initializeExpenseCategories = useCallback((propertyId: string): ExpenseCategory[] => {
        return expenseCategories.filter(c => c.propertyId === propertyId);
    }, [expenseCategories]);

    const getExpenseCategoriesForProperty = useCallback((propertyId: string): ExpenseCategory[] => {
        return expenseCategories.filter(c => c.propertyId === propertyId && !c.isArchived);
    }, [expenseCategories]);

    const addExpenseCategory = useCallback((propertyId: string, name: string) => {
        const newCategory: ExpenseCategory = {
            id: `cat_${Date.now()}`,
            propertyId,
            name,
            isPredefined: false,
            isArchived: false,
        };
        setExpenseCategories(prev => [...prev, newCategory]);
    }, []);

    const updateExpenseCategory = useCallback((categoryId: string, newName: string) => {
        setExpenseCategories(prev => prev.map(c => c.id === categoryId ? { ...c, name: newName } : c));
    }, []);

    const isExpenseCategoryInUse = useCallback((categoryId: string): boolean => {
        return monthlyOutcomes.some(o => o.categoryId === categoryId && o.isConfirmed);
    }, [monthlyOutcomes]);

    const archiveExpenseCategory = useCallback((categoryId: string) => {
        if (isExpenseCategoryInUse(categoryId)) {
            alert(t('delete_category_in_use_error'));
            return;
        }
        setExpenseCategories(prev => prev.map(c => c.id === categoryId ? { ...c, isArchived: true } : c));
    }, [isExpenseCategoryInUse, t]);

    const getMonthlyOutcomesForYear = useCallback((propertyId: string, year: number) => {
        return monthlyOutcomes.filter(o => o.propertyId === propertyId && o.year === year);
    }, [monthlyOutcomes]);

    const updateMonthlyOutcome = useCallback((outcomeData: Omit<MonthlyOutcome, 'id'>) => {
        const { propertyId, year, month, categoryId, amount, photoUrl, isConfirmed, confirmedAt, notes } = outcomeData;
        const id = `${propertyId}-${year}-${month}-${categoryId}`;
        const category = expenseCategories.find(c => c.id === categoryId);
        
        const newOutcome: MonthlyOutcome = { id, ...outcomeData };

        setMonthlyOutcomes(prev => {
            const existingIndex = prev.findIndex(o => o.id === id);
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex] = newOutcome;
                return updated;
            }
            return [...prev, newOutcome];
        });
        
        if (isConfirmed && category) {
             const newTransaction: OutcomeTransaction = {
                id: `otxn_${Date.now()}`,
                propertyId, year, month,
                amount,
                category: category.name,
// FIX: Use correct translation key "expense_confirmed_for" which has been added to the translations file.
                description: t('expense_confirmed_for', { category: category.name, month: new Date(year, month).toLocaleString('default', {month: 'long'}) }),
                transactionDate: confirmedAt || new Date().toISOString(),
            };
            setOutcomeTransactions(prev => [...prev, newTransaction]);
        }

    }, [expenseCategories, t]);
    
    const cancelMonthlyOutcome = useCallback((outcome: MonthlyOutcome, reason: string) => {
        const updatedOutcome: MonthlyOutcome = {
            ...outcome,
            isConfirmed: false,
            notes: reason,
        };
        setMonthlyOutcomes(prev => prev.map(o => o.id === outcome.id ? updatedOutcome : o));

        const category = expenseCategories.find(c => c.id === outcome.categoryId);
        if (category) {
            const newTransaction: OutcomeTransaction = {
                id: `otxn_${Date.now()}`,
                propertyId: outcome.propertyId,
                year: outcome.year,
                month: outcome.month,
                amount: -outcome.amount, // Record as a negative amount for cancellation
                category: category.name,
// FIX: Use correct translation key "expense_cancelled_for" which has been added to the translations file.
                description: t('expense_cancelled_for', { category: category.name, month: new Date(outcome.year, outcome.month).toLocaleString('default', {month: 'long'}), reason }),
                transactionDate: new Date().toISOString(),
            };
            setOutcomeTransactions(prev => [...prev, newTransaction]);
        }
    }, [expenseCategories, t]);

    // Exceptional Budget Management
    const addExceptionalProject = useCallback((projectData: Omit<ExceptionalProject, 'id' | 'propertyId'>) => {
        if (!selectedProperty) return;
        const newProject: ExceptionalProject = {
            id: `ep_${Date.now()}`,
            propertyId: selectedProperty.id,
            ...projectData
        };
        setExceptionalProjects(prev => [...prev, newProject]);
        
        const projectStartDate = new Date(projectData.startDate);
        const activeOwners = owners.filter(o => 
            o.propertyId === selectedProperty.id && 
            o.isActive &&
            (!o.joinDate || new Date(o.joinDate) <= projectStartDate)
        );

        if (activeOwners.length > 0) {
            const amountPerOwner = projectData.expectedIncome > 0 ? projectData.expectedIncome / activeOwners.length : 0;
            const newContributions: ExceptionalContribution[] = activeOwners.map(owner => ({
                id: `${newProject.id}-${owner.id}`,
                projectId: newProject.id,
                ownerId: owner.id,
                expectedAmount: amountPerOwner,
                paidAmount: 0,
                status: ContributionStatus.NOT_PAID,
            }));
            setExceptionalContributions(prev => [...prev, ...newContributions]);
        }
    }, [selectedProperty, owners]);

    const editExceptionalContribution = useCallback((id: string, updates: Partial<Omit<ExceptionalContribution, 'id' | 'projectId' | 'ownerId'>>) => {
        setExceptionalContributions(prev => prev.map(c => {
            if (c.id === id) {
                const updatedContribution = { ...c, ...updates };

                // Recalculate status
                if (updatedContribution.expectedAmount > 0 && updatedContribution.paidAmount >= updatedContribution.expectedAmount) {
                    updatedContribution.status = ContributionStatus.FULLY_PAID;
                } else if (updatedContribution.paidAmount > 0) {
                    updatedContribution.status = ContributionStatus.PARTIALLY_PAID;
                } else {
                    updatedContribution.status = ContributionStatus.NOT_PAID;
                }
                return updatedContribution;
            }
            return c;
        }));
    }, []);

    const addExternalContributor = useCallback((contributorData: Omit<ExternalContributor, 'id' | 'paidAmount' | 'status'>) => {
        const newContributor: ExternalContributor = {
            id: `ext_${Date.now()}`,
            ...contributorData,
            paidAmount: 0,
            status: ContributionStatus.NOT_PAID,
        };
        setExternalContributors(prev => [...prev, newContributor]);
    }, []);

    const editExternalContributor = useCallback((id: string, updates: Partial<Omit<ExternalContributor, 'id' | 'projectId'>>) => {
        setExternalContributors(prev => prev.map(c => {
            if (c.id === id) {
                const updatedContributor = { ...c, ...updates };
    
                // Recalculate status
                if (updatedContributor.expectedAmount > 0 && updatedContributor.paidAmount >= updatedContributor.expectedAmount) {
                    updatedContributor.status = ContributionStatus.FULLY_PAID;
                } else if (updatedContributor.paidAmount > 0) {
                    updatedContributor.status = ContributionStatus.PARTIALLY_PAID;
                } else {
                    updatedContributor.status = ContributionStatus.NOT_PAID;
                }
                return updatedContributor;
            }
            return c;
        }));
    }, []);

    const recordExceptionalPayment = useCallback((projectId: string, contributorId: string, contributorType: 'owner' | 'external', amount: number) => {
        const updater = (
            items: (ExceptionalContribution | ExternalContributor)[], 
            setter: React.Dispatch<React.SetStateAction<(ExceptionalContribution | ExternalContributor)[]>>
        ) => {
            const itemIndex = items.findIndex(item => item.id === (contributorType === 'owner' ? `${projectId}-${contributorId}` : contributorId));
            if (itemIndex === -1) return;

            const updatedItems = [...items];
            const item = updatedItems[itemIndex];
            const previousAmount = item.paidAmount;
            item.paidAmount += amount;
            
            if (item.expectedAmount > 0 && item.paidAmount >= item.expectedAmount) {
                item.status = ContributionStatus.FULLY_PAID;
            } else if (item.paidAmount > 0) {
                item.status = ContributionStatus.PARTIALLY_PAID;
            } else {
                item.status = ContributionStatus.NOT_PAID;
            }
            
            setter(updatedItems as any);
            
            const historyEntry: ExceptionalPaymentHistoryEntry = {
                transactionId: `etxn_${Date.now()}`,
                projectId,
                contributorId,
                contributorType,
                amountPaid: amount,
                transactionDate: new Date().toISOString(),
                previousAmount,
                newAmount: item.paidAmount,
            };
            setExceptionalPaymentHistory(prev => [...prev, historyEntry]);
        };

        if (contributorType === 'owner') {
            updater(exceptionalContributions, setExceptionalContributions);
        } else {
            updater(externalContributors, setExternalContributors);
        }
    }, [exceptionalContributions, externalContributors]);

    const addExceptionalOutcome = useCallback((outcomeData: Omit<ExceptionalOutcome, 'id' | 'isConfirmed' | 'confirmedAt'>) => {
        const newOutcome: ExceptionalOutcome = {
            id: `eo_${Date.now()}`,
            ...outcomeData,
            isConfirmed: false,
        };
        setExceptionalOutcomes(prev => [...prev, newOutcome]);
    }, []);

    const confirmExceptionalOutcome = useCallback((outcomeId: string) => {
        setExceptionalOutcomes(prev => prev.map(o => 
            o.id === outcomeId 
            ? { ...o, isConfirmed: true, confirmedAt: new Date().toISOString() } 
            : o
        ));
    }, []);

    const cancelExceptionalOutcome = useCallback((outcomeId: string, reason: string) => {
        setExceptionalOutcomes(prev => prev.map(o => 
            o.id === outcomeId 
            ? { ...o, isConfirmed: false, notes: reason } 
            : o
        ));
    }, []);
    
    // Archive
    const addArchivedDocument = useCallback((docData: Omit<ArchivedDocument, 'id' | 'propertyId' | 'uploadDate'>) => {
        if (!selectedProperty) return;
        const newDoc: ArchivedDocument = {
            id: `doc_${Date.now()}`,
            propertyId: selectedProperty.id,
            ...docData,
            uploadDate: new Date().toISOString(),
        };
        setArchivedDocuments(prev => [...prev, newDoc]);
    }, [selectedProperty]);

    const deleteArchivedDocument = useCallback((docId: string) => {
        setArchivedDocuments(prev => prev.filter(doc => doc.id !== docId));
    }, []);

    const getOverdueDetailsForOwner = useCallback((ownerId: string): { totalDue: number; months: { year: number; month: number; amount: number }[] } => {
        const getMonthCategory = (year: number, month: number): 'past' | 'current' | 'future' => {
            const now = new Date();
            now.setHours(0,0,0,0);
            const date = new Date(year, month);
            if (date.getFullYear() < now.getFullYear() || (date.getFullYear() === now.getFullYear() && date.getMonth() < now.getMonth())) return 'past';
            if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) return 'current';
            return 'future';
        };

        const getAdjustedMonthlyFee = (baseFee: number, policy: UnitTypeFeePolicy | undefined, monthCategory: 'past' | 'current' | 'future'): number => {
            if (!policy) return baseFee;
            if (monthCategory === 'past' && policy.penalty.amount > 0) {
                return baseFee + (policy.penalty.type === AmountType.FIXED ? policy.penalty.amount : baseFee * (policy.penalty.amount / 100));
            }
            if (monthCategory === 'future' && policy.discount.amount > 0) {
                return baseFee - (policy.discount.type === AmountType.FIXED ? policy.discount.amount : baseFee * (policy.discount.amount / 100));
            }
            return baseFee;
        };

        const owner = owners.find(o => o.id === ownerId);
        if (!selectedProperty || !owner) return { totalDue: 0, months: [] };

        const ownerUnits = units.filter(u => u.ownerId === ownerId);
        if (ownerUnits.length === 0) return { totalDue: 0, months: [] };

        const unitType = unitTypes.find(ut => ut.id === ownerUnits[0].unitTypeId);
        if (!unitType) return { totalDue: 0, months: [] };

        const overdueMonths: { year: number; month: number; amount: number }[] = [];
        let totalDue = 0;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const ownerJoinDate = new Date(owner.joinDate);
        const pcdString = selectedProperty.details.constructionDate;
        // Check for empty string and valid date
        const propertyConstructionDate = pcdString && !isNaN(new Date(pcdString).getTime()) 
            ? new Date(pcdString) 
            : null;

        // The start date for calculating fees is the later of the two: when the property was built, or when the owner joined.
        const startDate = propertyConstructionDate && propertyConstructionDate > ownerJoinDate
            ? propertyConstructionDate
            : ownerJoinDate;
        
        let iterDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const endDate = new Date(currentYear, currentMonth, 1);

        while (iterDate < endDate) {
            const year = iterDate.getFullYear();
            const month = iterDate.getMonth();

            const policy = getUnitTypeFeePolicy(selectedProperty.id, year, unitType.id);
            const baseFee = policy?.baseFee || 0;
            const monthCategory = getMonthCategory(year, month);
            const adjustedDue = getAdjustedMonthlyFee(baseFee, policy, monthCategory);

            const payment = monthlyPayments.find(p => p.propertyId === selectedProperty.id && p.ownerId === ownerId && p.year === year && p.month === month);
            const amountPaid = payment?.amountPaid || 0;
            const deficit = adjustedDue - amountPaid;

            if (deficit > 0 && payment?.status !== PaymentStatus.PAUSED) {
                overdueMonths.push({ year, month, amount: deficit });
                totalDue += deficit;
            }

            iterDate.setMonth(iterDate.getMonth() + 1);
        }

        return { totalDue, months: overdueMonths };
    }, [selectedProperty, owners, units, unitTypes, monthlyPayments, getUnitTypeFeePolicy]);

  // Data Management
    const backupData = useCallback(() => {
        const backupData: { [key: string]: any } = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('hoa-')) {
                try {
                    backupData[key] = JSON.parse(localStorage.getItem(key)!);
                } catch (e) {
                    console.warn(`Could not parse localStorage item ${key}`);
                }
            }
        }
        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        const date = new Date().toISOString().split('T')[0];
        link.download = `hoa-backup-${date}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    }, []);

    const restoreData = useCallback(async (fileContent: string) => {
        try {
            const data = JSON.parse(fileContent);
            if (typeof data !== 'object' || data === null || !data['hoa-properties']) {
                throw new Error('Invalid backup file structure.');
            }

            Object.keys(localStorage)
                .filter(key => key.startsWith('hoa-'))
                .forEach(key => localStorage.removeItem(key));

            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key) && key.startsWith('hoa-')) {
                    localStorage.setItem(key, JSON.stringify(data[key]));
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            window.location.reload();

        } catch (error) {
            console.error("Restore failed:", error);
            throw error;
        }
    }, []);

  // Unsaved changes flow implementation
  const registerActions = useCallback((save: () => Promise<void>, discard: () => void) => {
    saveCallback.current = save;
    discardCallback.current = discard;
  }, []);

  const unregisterActions = useCallback(() => {
      saveCallback.current = null;
      discardCallback.current = null;
  }, []);
  
  const showUnsavedChangesModal = useCallback((onNavigate: () => void) => {
    pendingNavigation.current = onNavigate;
    setIsUnsavedChangesModalOpen(true);
  }, []);

  const handleSaveChangesAndNavigate = useCallback(async () => {
    if (saveCallback.current) {
        await saveCallback.current();
    }
    if (pendingNavigation.current) {
        pendingNavigation.current();
    }
    setHasUnsavedChanges(false);
    setIsUnsavedChangesModalOpen(false);
    pendingNavigation.current = null;
  }, []);

  const handleDiscardChangesAndNavigate = useCallback(() => {
    if (discardCallback.current) {
        discardCallback.current();
    }
    if (pendingNavigation.current) {
        pendingNavigation.current();
    }
    setHasUnsavedChanges(false);
    setIsUnsavedChangesModalOpen(false);
    pendingNavigation.current = null;
  }, []);

  const handleCancelNavigation = useCallback(() => {
    setIsUnsavedChangesModalOpen(false);
    pendingNavigation.current = null;
  }, []);

  const showSuccessMessage = useCallback((message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  }, []);

  return (
    <DataContext.Provider value={{ 
        properties, 
        selectedProperty, 
        activeModule, 
        unitTypes,
        units,
        owners,
        committeeMembers,
        monthlyPayments,
        paymentHistory,
        unitTypeFeePolicies,
        expenseCategories,
        monthlyOutcomes,
        outcomeTransactions,
        exceptionalProjects,
        exceptionalContributions,
        externalContributors,
        exceptionalOutcomes,
        exceptionalPaymentHistory,
        archivedDocuments,
        addProperty, 
        editProperty,
        updatePropertyDetails,
        deleteProperty, 
        selectProperty, 
        setActiveModule,
        addUnitType,
        editUnitType,
        deleteUnitType,
        isUnitTypeInUse,
        isUnitCodeUnique,
        isOwnershipTitleCodeUnique,
        addOwnerWithUnit,
        editOwnerWithUnit,
        toggleOwnerStatus,
        getUnitsByOwner,
        addCommitteeMember,
        editCommitteeMember,
        deleteCommitteeMember,
        getPaymentsForYear,
        recordPayment,
        setPaymentStatus,
        getUnitTypeFeePolicy,
        updateUnitTypeFeePolicies,
        getOverdueDetailsForOwner,
        initializeExpenseCategories,
        getExpenseCategoriesForProperty,
        addExpenseCategory,
        updateExpenseCategory,
        archiveExpenseCategory,
        isExpenseCategoryInUse,
        getMonthlyOutcomesForYear,
        updateMonthlyOutcome,
        cancelMonthlyOutcome,
        addExceptionalProject,
        editExceptionalContribution,
        addExternalContributor,
        editExternalContributor,
        recordExceptionalPayment,
        addExceptionalOutcome,
        confirmExceptionalOutcome,
        cancelExceptionalOutcome,
        addArchivedDocument,
        deleteArchivedDocument,
        backupData,
        restoreData,
        hasUnsavedChanges,
        setHasUnsavedChanges,
        isUnsavedChangesModalOpen,
        showUnsavedChangesModal,
        handleSaveChangesAndNavigate,
        handleDiscardChangesAndNavigate,
        handleCancelNavigation,
        registerActions,
        unregisterActions,
        successMessage,
        showSuccessMessage,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
