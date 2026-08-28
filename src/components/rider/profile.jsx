export default function Profile() {
  return (
    <div>
      <h2>Rider Account</h2>
      <p>Join the delivery team</p>

      <form>
        <div>
          <label>Full name</label>
          <input type="text" placeholder="Your full name" />
        </div>

        <div>
          <label>Phone number</label>
          <input type="tel" placeholder="+234 800 000 0000" />
        </div>

        <div>
          <label>Vehicle</label>
          <select>
            <option>Motorcycle</option>
            <option>Bicycle</option>
            <option>Car</option>
          </select>
        </div>

        <button type="submit">Create rider profile</button>
      </form>
    </div>
  );
}
