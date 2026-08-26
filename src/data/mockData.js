export const mockDeliveries = [
	{ id: "DL-1048", customer_name: "Maya Okafor", address: "18 Palm Avenue", status: "pending", rider_id: null },
	{ id: "DL-1047", customer_name: "Jon Bell", address: "42 Market Street", status: "assigned", rider_id: 2 },
	{ id: "DL-1046", customer_name: "Amina Yusuf", address: "7 Riverside Walk", status: "out_for_delivery", rider_id: 1 },
	{ id: "DL-1045", customer_name: "Noah Williams", address: "91 King Road", status: "delivered", rider_id: 3 },
];

export const mockRiders = [
	{ id: 1, name: "Tobi Adeyemi", status: "available" },
	{ id: 2, name: "Grace Mensah", status: "on_delivery" },
	{ id: 3, name: "Daniel Cole", status: "available" },
];
