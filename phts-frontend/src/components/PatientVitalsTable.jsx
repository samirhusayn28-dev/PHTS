function PatientVitalsTable({ vitals = [], onEdit }) {
  return (
    <table border="1" cellPadding="8" style={{ width: "100%" }}>
      <thead>
        <tr>
          <th>Date</th>
          <th>Time</th>
          <th>Heart Rate</th>
          <th>BP</th>
          <th>Oxygen</th>
          <th>Notes</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {vitals.map(v => (
          <tr key={v.VitalID}>
            <td>{v.RecordedDate}</td>
            <td>{v.RecordedTime}</td>
            <td>{v.HeartRate}</td>
            <td>{v.BloodPressureSys}/{v.BloodPressureDia}</td>
            <td>{v.OxygenSaturation}</td>
            <td>{v.Notes}</td>
            <td>
              <button onClick={() => onEdit(v)}>
                Update
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default PatientVitalsTable;
