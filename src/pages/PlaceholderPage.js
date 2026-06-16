import AppShell from '../components/layout/AppShell';

function PlaceholderPage({ title }) {
  return (
    <AppShell>
      <main className="placeholder-page">
        <div>
          <p>AfricanMovies</p>
          <h1>{title}</h1>
        </div>
      </main>
    </AppShell>
  );
}

export default PlaceholderPage;
