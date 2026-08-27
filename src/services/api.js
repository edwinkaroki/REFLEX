const API_BASE = "http://localhost:8000/api";

// Get deliveries for dispatcher dashboard
export async function getDeliveries(token) {
  const response = await fetch(
    `${API_BASE}/deliveries`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch deliveries");
  }

  return response.json();
}

// Get riders for dispatcher dashboard
export async function getRiders(token) {
  const response = await fetch(
    `${API_BASE}/riders`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch riders");
  }

  return response.json();
}

// Assign delivery to rider
export async function assignRider(deliveryId, riderId, token) {
  const response = await fetch(
    `${API_BASE}/assignments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        delivery_id: deliveryId,
        rider_id: riderId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to assign rider");
  }

  return response.json();
}

// Update assignment
export async function updateAssignment(
  assignmentId,
  status,
  token
) {
  const response = await fetch(
    `${API_BASE}/assignments/${assignmentId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update assignment");
  }

  return response.json();
}