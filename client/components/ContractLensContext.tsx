import { createContext, useContext, useMemo, useState } from "react";
import { AlertItem, Contract, initialAlerts, initialContracts, initialObligations, Obligation } from "./ContractLensData";

interface ContractLensContextValue {
  contracts: Contract[];
  obligations: Obligation[];
  alerts: AlertItem[];
  addContract: (contract: Contract) => void;
  completeObligation: (id: string) => void;
  markAlertRead: (id: string) => void;
  dismissAlert: (id: string) => void;
}

const ContractLensContext = createContext<ContractLensContextValue | null>(null);

export function ContractLensProvider({ children }: { children: React.ReactNode }) {
  const [contracts, setContracts] = useState(initialContracts);
  const [obligations, setObligations] = useState(initialObligations);
  const [alerts, setAlerts] = useState(initialAlerts);

  const value = useMemo(() => ({
    contracts,
    obligations,
    alerts,
    addContract: (contract: Contract) => setContracts((current) => [contract, ...current]),
    completeObligation: (id: string) => setObligations((current) => current.map((item) => item.id === id ? { ...item, status: "Completed" as const } : item)),
    markAlertRead: (id: string) => setAlerts((current) => current.map((alert) => alert.id === id ? { ...alert, read: true } : alert)),
    dismissAlert: (id: string) => setAlerts((current) => current.filter((alert) => alert.id !== id)),
  }), [alerts, contracts, obligations]);

  return <ContractLensContext.Provider value={value}>{children}</ContractLensContext.Provider>;
}

export function useContractLens() {
  const context = useContext(ContractLensContext);
  if (!context) throw new Error("useContractLens must be used inside ContractLensProvider");
  return context;
}
