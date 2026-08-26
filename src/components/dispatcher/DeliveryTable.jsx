import StatusBadge from "./StatusBadge";
import { ArrowRight } from "lucide-react";

export default function DeliveryTable({ deliveries, riders, onAssign }) {
	return (
		<div className="delivery-list">
			{deliveries.map((delivery) => {
				const rider = riders.find((item) => item.id === delivery.rider_id);
				return (
					<div className="delivery-row" key={delivery.id}>
						<div className="order-cell"><strong>#{delivery.id}</strong><small>10:12</small></div>
						<div className="customer-cell"><strong>{delivery.customer_name}</strong><small>{delivery.address}</small></div>
						<div className="package-cell"><strong>{delivery.package || "Parcel delivery"}</strong><small>Standard delivery</small></div>
						<div className="rider-cell">{rider ? <><span className="rider-avatar">{rider.name.charAt(0)}</span><small>{rider.name}</small></> : <span className="assigned-rider">Unassigned</span>}</div>
						<StatusBadge status={delivery.status} />
						{delivery.status === "pending" ? <button className="assign-button" onClick={() => onAssign(delivery)}>View <ArrowRight size={13} /></button> : <button className="row-view">View <ArrowRight size={13} /></button>}
					</div>
				);
			})}
		</div>
	);
}
