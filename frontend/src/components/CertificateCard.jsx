export default function CertificateCard({ cert }) {
  return (
    <div className="cert-card">
      <h3>{cert.certificateName}</h3>
      <p>Category: {cert.category}</p>
      <p>Issuer: {cert.issuer}</p>
      <p className={cert.status === "valid" ? "valid" : "revoked"}>
        {cert.status === "valid" ? "✅ Verified" : "❌ Revoked"}
      </p>

      <div className="cert-actions">
        <button>View</button>
        <button>Share</button>
      </div>
    </div>
  );
}
