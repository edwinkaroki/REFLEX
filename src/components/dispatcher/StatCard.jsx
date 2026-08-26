export default function StatCard({ title, value, icon }) {
	return (
		<article className="stat-card">
			<div className="stat-icon">{icon}</div>
			<div>
				<p className="stat-title">{title}</p>
				<strong className="stat-value">{value}</strong>
			</div>
		</article>
	);
}
