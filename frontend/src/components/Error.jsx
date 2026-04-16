import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './common/Button';
import Card from './common/Card';

export default function Error() {
  const navigate = useNavigate();

  return (
    <section className="page page--center error-page">
      <Card className="error-card">
        <div className="error-card__badge">404</div>
        <div className="error-card__illustration">Field Missing</div>
        <h1>Page Not Found</h1>
        <p>
          This page is not available right now. The route may be missing, outdated, or no longer part of the
          current app flow.
        </p>
        <div className="error-card__actions">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Link to="/" className="error-card__home-link">
            <Button type="button">Go Home</Button>
          </Link>
        </div>
      </Card>
    </section>
  );
}
