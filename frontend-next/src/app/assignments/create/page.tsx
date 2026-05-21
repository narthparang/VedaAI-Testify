import CreateAssignmentForm from '@/components/assignments/CreateAssignmentForm';

export const metadata = { title: 'Create Assignment – VedaAI' };

export default function CreateAssignmentPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Create Assignment</h1>
        <p className="text-sm text-gray-500 mt-1">Set up a new assignment for your students</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <CreateAssignmentForm />
      </div>
    </div>
  );
}
