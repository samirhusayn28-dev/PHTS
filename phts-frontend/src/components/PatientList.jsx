import PatientCard from "./PatientCard";

function PatientList({ patients }) {
  return (
    <div className="space-y-4">
      {patients.map((p, i) => (
        <PatientCard key={i} {...p} />
      ))}
    </div>
  );
}

export default PatientList;
