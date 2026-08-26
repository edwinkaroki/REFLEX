import { useState } from "react";
import { Bike, UserRound } from "lucide-react";
import Sidebar from "../../components/shared/Sidebar";

export default function RiderDashboard({ role, setRole }) {
	const [profile, setProfile] = useState(() => JSON.parse(localStorage.getItem("reflex-rider") || "null"));
	const [mobileOpen, setMobileOpen] = useState(false);
	const [form, setForm] = useState({ name: "", phone: "", vehicle: "motorcycle" });

	function createRider(event) {
		event.preventDefault();
		const nextProfile = { ...form, createdAt: new Date().toISOString() };
		localStorage.setItem("reflex-rider", JSON.stringify(nextProfile));
		setProfile(nextProfile);
	}

	return (
		<div className="min-h-screen bg-canvas"><Sidebar role={role} setRole={setRole} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
			<main className="md:ml-64"><header className="topbar"><div><h2>Rider Workspace</h2><p className="text-sm text-muted">Create your rider profile and prepare for deliveries.</p></div><button className="mobile-menu" onClick={() => setMobileOpen(true)}>Menu</button></header>
				<div className="profile-page">
					<section className="profile-intro"><div className="profile-icon"><Bike /></div><div><p className="eyebrow">Rider account</p><h1>Join the delivery team</h1><p className="text-muted">Each rider creates and owns their own profile. Availability can be connected to dispatch later.</p></div></section>
					{profile ? <section className="profile-success"><strong>{profile.name}</strong><p>{profile.phone} · {profile.vehicle}</p><button className="secondary-button" onClick={() => setProfile(null)}>Edit profile</button></section> : <form className="profile-form" onSubmit={createRider}><label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your full name" /></label><label>Phone number<input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+234 800 000 0000" /></label><label>Vehicle<select value={form.vehicle} onChange={(event) => setForm({ ...form, vehicle: event.target.value })}><option value="motorcycle">Motorcycle</option><option value="bicycle">Bicycle</option><option value="car">Car</option></select></label><button className="primary-button" type="submit"><UserRound size={17} /> Create rider profile</button></form>}
				</div>
			</main>
		</div>
	);
}
