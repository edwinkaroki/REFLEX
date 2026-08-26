import StatusBadge from "./StatusBadge";

export default function RiderList({ riders }) {
	return (
		<div className="rider-list">
			{riders.map((rider) => (
				<div className="rider-row" key={rider.id}>
					<span className="rider-avatar">{rider.name.charAt(0)}</span>
					<strong>{rider.name}</strong>
					<StatusBadge status={rider.status} />
				</div>
			))}
		</div>
	);
}
