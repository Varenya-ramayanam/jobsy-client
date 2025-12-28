export default function JobCard({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <div
      style={{
        padding: 20,
        border: "1px solid #333",
        borderRadius: 8,
        width: 200,
      }}
    >
      <h4>{title}</h4>
      <p style={{ fontSize: 24 }}>{count}</p>
    </div>
  );
}
