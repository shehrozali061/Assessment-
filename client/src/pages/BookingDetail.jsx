import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/api';

const carImage =
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80';

function formatDate(dateValue) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${dateValue}T12:00:00`));
}

function calculateDays(startDate, endDate) {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
}

function getOperationalStatus(booking) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dropOff = new Date(`${booking.endDate}T00:00:00`);

  if (['confirmed', 'active'].includes(booking.status) && dropOff < today) {
    return 'overdue';
  }

  return booking.status || 'confirmed';
}

function BookingDetail() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBooking = useCallback(async () => {
    try {
      const bookingData = await api.getBooking(bookingId);
      const [customerData, vehicleData] = await Promise.all([
        api.getCustomer(bookingData.customerId),
        api.getVehicle(bookingData.vehicleId),
      ]);

      setBooking(bookingData);
      setCustomer(customerData);
      setVehicle(vehicleData);
    } catch {
      setError('Failed to load booking detail');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    queueMicrotask(loadBooking);
  }, [loadBooking]);

  const summary = useMemo(() => {
    if (!booking || !vehicle) return null;

    const durationDays = calculateDays(booking.startDate, booking.endDate);
    const baseRate = booking.totalPrice || durationDays * vehicle.pricePerDay;
    const addOns = 45;
    const securityDeposit = 300;
    const amountDue = baseRate + addOns;

    return {
      durationDays,
      baseRate,
      addOns,
      securityDeposit,
      amountDue,
      dailyRate: vehicle.pricePerDay,
      status: getOperationalStatus(booking),
    };
  }, [booking, vehicle]);

  if (loading) return <div className="loading">Loading booking handover...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!booking || !customer || !vehicle || !summary) {
    return <div className="empty-state">Booking not found</div>;
  }

  const bookingCode = '#BKG-2026';
  const licenseVerified = Boolean(customer.licenseNumber);
  const depositCollected = booking.status === 'active' || booking.status === 'completed';

  return (
    <article className="booking-detail">
      <header className="booking-detail__header">
        <div>
          <Link className="back-link" to="/bookings">Back to bookings</Link>
          <div className="booking-title-row">
            <h1>Booking Detail</h1>
            <span className={`status status-large ${summary.status}`}>
              {summary.status}
            </span>
          </div>
          <p className="booking-meta">
            <strong>{bookingCode}</strong>
            <span>{customer.name}</span>
            <span>{vehicle.licensePlate}</span>
          </p>
        </div>
        <button className="btn btn-primary agreement-btn">Generate Rental Agreement</button>
      </header>

      <div className="booking-detail__grid">
        <section className="operations-column" aria-label="Booking operations">
          <section className="card ops-panel" aria-labelledby="timeline-title">
            <div className="section-heading">
              <div>
                <h2 id="timeline-title">Rental Timeline</h2>
                <p>Pickup and return commitments for counter handover.</p>
              </div>
              <span className="duration-badge">{summary.durationDays} days total</span>
            </div>

            <div className="rental-timeline">
              <div className="timeline-stop">
                <span className="timeline-dot pickup-dot" aria-hidden="true" />
                <div>
                  <p className="label">Pick-up</p>
                  <h3>Airport Terminal Counter</h3>
                  <p>{formatDate(booking.startDate)} at 09:00 AM</p>
                </div>
              </div>
              <div className="timeline-connector" aria-hidden="true" />
              <div className="timeline-stop">
                <span className="timeline-dot dropoff-dot" aria-hidden="true" />
                <div>
                  <p className="label">Drop-off</p>
                  <h3>Downtown Fleet Yard</h3>
                  <p>{formatDate(booking.endDate)} at 06:00 PM</p>
                </div>
              </div>
            </div>
          </section>

          <section className="vehicle-customer-grid">
            <div className="card vehicle-profile" aria-labelledby="vehicle-title">
              <img src={carImage} alt={`${vehicle.make} ${vehicle.model}`} />
              <div className="vehicle-profile__body">
                <div className="section-heading compact">
                  <div>
                    <p className="label">Vehicle Profile</p>
                    <h2 id="vehicle-title">{vehicle.year} {vehicle.make} {vehicle.model}</h2>
                  </div>
                  <button className="btn btn-secondary">Swap Vehicle</button>
                </div>
                <dl className="metric-grid">
                  <div>
                    <dt>Plate</dt>
                    <dd>{vehicle.licensePlate}</dd>
                  </div>
                  <div>
                    <dt>Category</dt>
                    <dd>{vehicle.category}</dd>
                  </div>
                  <div>
                    <dt>Fuel</dt>
                    <dd>7/8 tank</dd>
                  </div>
                  <div>
                    <dt>Odometer</dt>
                    <dd>24,810 mi</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="card verification-card" aria-labelledby="verification-title">
              <div className="section-heading compact">
                <div>
                  <p className="label">Customer</p>
                  <h2 id="verification-title">Verification Checklist</h2>
                </div>
              </div>
              <div className="customer-snapshot">
                <strong>{customer.name}</strong>
                <span>{customer.phone}</span>
                <span>{customer.email}</span>
              </div>
              <ul className="verification-list">
                <li className={licenseVerified ? 'is-pass' : 'is-fail'}>
                  <span className="check-indicator" aria-hidden="true" />
                  <div>
                    <strong>Driver's License</strong>
                    <small>{licenseVerified ? customer.licenseNumber : 'Missing license record'}</small>
                  </div>
                </li>
                <li className={depositCollected ? 'is-pass' : 'is-fail'}>
                  <span className="check-indicator" aria-hidden="true" />
                  <div>
                    <strong>Security Deposit Status</strong>
                    <small>{depositCollected ? 'Collected and authorized' : 'Pending collection'}</small>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section className="card audit-card" aria-labelledby="audit-title">
            <div className="section-heading compact">
              <div>
                <p className="label">Internal Audit Logs</p>
                <h2 id="audit-title">Operational Trail</h2>
              </div>
            </div>
            <ol className="audit-timeline">
              <li>
                <time>08:42 AM</time>
                <span>Booking opened by counter manager</span>
              </li>
              <li>
                <time>08:45 AM</time>
                <span>License record checked against customer profile</span>
              </li>
              <li>
                <time>08:47 AM</time>
                <span>Vehicle condition placeholders queued for handover</span>
              </li>
            </ol>
          </section>
        </section>

        <aside className="card financial-sidebar" aria-labelledby="financial-title">
          <div className="section-heading compact">
            <div>
              <p className="label">Financial Breakdown</p>
              <h2 id="financial-title">Amount to Collect</h2>
            </div>
          </div>
          <dl className="charge-list">
            <div>
              <dt>Base Rate</dt>
              <dd>${summary.baseRate}</dd>
            </div>
            <div>
              <dt>{summary.durationDays} days x ${summary.dailyRate}/day</dt>
              <dd className="muted">Included</dd>
            </div>
            <div>
              <dt>Add-ons</dt>
              <dd>${summary.addOns}</dd>
            </div>
            <div>
              <dt>Security Deposit</dt>
              <dd>${summary.securityDeposit}</dd>
            </div>
          </dl>
          <div className="amount-due">
            <span>Amount Due</span>
            <strong>${summary.amountDue}</strong>
            <small>Deposit held separately at authorization.</small>
          </div>
          <button className="btn btn-success collect-btn">Collect Payment</button>
        </aside>
      </div>
    </article>
  );
}

export default BookingDetail;
