import { useState } from "react";
import { Building2, PackagePlus } from "lucide-react";
import Sidebar from "../../components/shared/Sidebar";

export default function RetailerDashboard({ role, setRole }) {
	const [profile, setProfile] = useState(() => JSON.parse(localStorage.getItem("reflex-retailer") || "null"));
	const [mobileOpen, setMobileOpen] = useState(false);
	const [form, setForm] = useState({ businessName: "", contactName: "", phone: "" });

	function createRetailer(event) {
		event.preventDefault();
		const nextProfile = { ...form, createdAt: new Date().toISOString() };
		localStorage.setItem("reflex-retailer", JSON.stringify(nextProfile));
		setProfile(nextProfile);
	}

	return (
		<div className="min-h-screen bg-canvas"><Sidebar role={role} setRole={setRole} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
			<main className="md:ml-64"><header className="topbar"><div><h2>Retailer Workspace</h2><p className="text-sm text-muted">Create your store profile and manage delivery requests.</p></div><button className="mobile-menu" onClick={() => setMobileOpen(true)}>Menu</button></header>
				<div className="profile-page">
					<section className="profile-intro"><div className="profile-icon"><Building2 /></div><div><p className="eyebrow">Retailer account</p><h1>Set up your business</h1><p className="text-muted">This profile belongs to the retailer creating it and can later be connected to the delivery API.</p></div></section>
					{profile ? <section className="profile-success"><strong>{profile.businessName}</strong><p>{profile.contactName} · {profile.phone}</p><button className="secondary-button" onClick={() => setProfile(null)}>Edit profile</button></section> : <form className="profile-form" onSubmit={createRetailer}><label>Business name<input required value={form.businessName} onChange={(event) => setForm({ ...form, businessName: event.target.value })} placeholder="e.g. Palm Street Market" /></label><label>Contact name<input required value={form.contactName} onChange={(event) => setForm({ ...form, contactName: event.target.value })} placeholder="Your name" /></label><label>Phone number<input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+234 800 000 0000" /></label><button className="primary-button" type="submit"><PackagePlus size={17} /> Create retailer profile</button></form>}
				</div>
			</main>
		</div>
	);
}