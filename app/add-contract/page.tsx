import { Header } from '@/components/layout/header';
import { ContractForm } from '@/components/add-contract/contract-form';

export default function AddContractPage() {
  return (
    <div className="space-y-8">
      <Header
        title="Add New License"
        subtitle="Create a new license agreement record"
      />
      <ContractForm />
    </div>
  );
}
