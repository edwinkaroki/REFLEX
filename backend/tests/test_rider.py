from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def login_as(email: str, password: str) -> str:
    response = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


def test_rider_profile_and_current_delivery() -> None:
    token = login_as("rider1@fleet.com", "rider123")
    headers = {"Authorization": f"Bearer {token}"}

    profile_response = client.get("/api/rider/profile", headers=headers)
    assert profile_response.status_code == 200, profile_response.text
    profile = profile_response.json()
    assert profile["email"] == "rider1@fleet.com"
    assert profile["role"] == "rider"

    current_delivery_response = client.get(
        "/api/rider/current-delivery",
        headers=headers,
    )
    assert current_delivery_response.status_code == 200, current_delivery_response.text
    delivery = current_delivery_response.json()
    assert delivery is not None
    assert str(delivery["retailer_id"]) == "11111111-1111-1111-1111-111111111111"

    status_response = client.post(
        "/api/rider/delivery/77777777-7777-7777-7777-777777777777/status",
        headers=headers,
        json={"status": "picked_up"},
    )
    assert status_response.status_code == 200, status_response.text
    assert status_response.json()["status"] == "picked_up"


def test_rider_location_update() -> None:
    token = login_as("rider1@fleet.com", "rider123")
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post(
        "/api/rider/location",
        headers=headers,
        json={"latitude": -1.3001, "longitude": 36.9012},
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["latitude"] == -1.3001
    assert body["longitude"] == 36.9012
