const labels = {
	pending: "Pending",
	assigned: "Assigned",
	picked_up: "Picked up",
	in_transit: "In transit",
	delivered: "Delivered",
	cancelled: "Cancelled",
	available: "Available",
	busy: "Busy",
	offline: "Offline",
};

export default function StatusBadge({ status }) {
	return <span className={`status-badge status-${status}`}>{labels[status] || status}</span>;
}
