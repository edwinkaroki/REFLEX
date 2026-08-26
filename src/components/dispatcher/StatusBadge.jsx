const labels = {
	pending: "Pending",
	assigned: "Assigned",
	picked_up: "Picked up",
	out_for_delivery: "Out for delivery",
	delivered: "Delivered",
	available: "Available",
	on_delivery: "On delivery",
};

export default function StatusBadge({ status }) {
	return <span className={`status-badge status-${status}`}>{labels[status] || status}</span>;
}
