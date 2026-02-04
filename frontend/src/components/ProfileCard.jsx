export default function ProfileCard({ user }) {
  return (
    <div className="profile-card">
      <h2>{user.name}</h2>
      <p className="role">{user.role}</p>

      <p className="bio">
        {user.bio || "No bio added yet"}
      </p>

      <div className="ids">
        {user.studentId && <p>🎓 Student ID: {user.studentId}</p>}
        {user.workId && <p>💼 Work ID: {user.workId}</p>}
      </div>
    </div>
  );
}
